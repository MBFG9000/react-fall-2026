import { useEffect, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router';
import CrewCard from '../components/CrewCard.jsx';
import BarList from '../components/dashboard/BarList.jsx';
import ClearanceColumns from '../components/dashboard/ClearanceColumns.jsx';
import StatTile from '../components/dashboard/StatTile.jsx';
import StatusSplit from '../components/dashboard/StatusSplit.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { DashboardSkeleton } from '../components/Skeletons.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { DEPARTMENTS } from '../constants.js';
import { getAllCrew } from '../services/service.js';
import { computeCrewStats } from '../utils/crewStats.js';
import { crewListHref } from '../utils/crewFilters.js';
import { percent } from '../utils/format.js';
import { setPageTitle } from '../utils/pageTitle.js';
import { addLog } from '../utils/requestLog.js';

function formatNumber(value, digits = 1) {
    return value === null ? '—' : value.toFixed(digits);
}

export default function DashboardPage() {
    const { setLog, dataVersion } = useOutletContext();
    const [searchParams, setSearchParams] = useSearchParams();

    // The department filter lives in the URL (?department=Science) and is sent
    // to the API, so the statistics below are computed from the server's answer.
    const rawDepartment = searchParams.get('department') ?? '';
    const department = DEPARTMENTS.includes(rawDepartment) ? rawDepartment : '';

    const [crew, setCrew] = useState(null); // every crew member in the selected department
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        setPageTitle('Dashboard');
    }, []);

    useEffect(() => {
        let ignore = false;
        const label = `GET /items?${department ? `department=${department}&` : ''}limit=1000 (dashboard)`;
        const startedAt = Date.now();

        setStatus('loading'); // the old numbers stay on screen (dimmed) until the answer arrives
        setError(null);

        getAllCrew(department)
            .then((data) => {
                if (ignore) {
                    // Another department was picked before this answer came. Drop it.
                    addLog(setLog, label, 'stale', startedAt);
                    return;
                }
                addLog(setLog, label, 'ok', startedAt);
                setCrew(data);
                setStatus('success');
            })
            .catch((err) => {
                addLog(setLog, label, ignore ? 'stale' : 'error', startedAt);
                if (ignore) return;
                setError(err);
                setStatus('error');
            });

        return () => {
            ignore = true;
        };
    }, [department, reloadKey, dataVersion, setLog]);

    // Plain calculation on every render: 18 crew members is cheap to count.
    const stats = crew ? computeCrewStats(crew) : null;
    const isLoading = status === 'loading';
    const isRefreshing = isLoading && crew !== null;

    function reload() {
        setReloadKey((k) => k + 1);
    }

    function selectDepartment(value) {
        setSearchParams(value ? { department: value } : {}, { preventScrollReset: true });
    }

    const scopeLabel = department || 'the whole ship';

    function renderContent() {
        if (isLoading && !crew) {
            return (
                <div role="status">
                    <p className="sr-only">Loading statistics…</p>
                    <DashboardSkeleton />
                </div>
            );
        }

        if (status === 'error') {
            return (
                <StateMessage tone="error" title="Could not load the statistics" text={error.message}>
                    <button type="button" className="btn btn--primary" onClick={reload}>
                        Try again
                    </button>
                </StateMessage>
            );
        }

        if (stats.total === 0) {
            return (
                <StateMessage
                    title={department ? `Nobody is assigned to ${department}` : 'The roster is empty'}
                    text="Pick another department, or add crew members on the roster page."
                >
                    <Link to="/crew" className="btn btn--ghost">
                        Go to the roster
                    </Link>
                </StateMessage>
            );
        }

        return (
            <div className={`dashboard ${isRefreshing ? 'dashboard--refreshing' : ''}`} aria-busy={isRefreshing}>
                <div className="kpi-row">
                    <StatTile label="Crew members" value={stats.total} detail={`in ${scopeLabel}`} />
                    <StatTile
                        label="On duty now"
                        value={stats.onDuty}
                        detail={`${percent(stats.onDuty, stats.total)}% of the crew in view`}
                    />
                    <StatTile label="Average clearance" value={formatNumber(stats.averageClearance)} detail="out of 5 levels" />
                    <StatTile
                        label="Average time aboard"
                        value={`${formatNumber(stats.averageYearsAboard)} yrs`}
                        detail="since joining the Meridian"
                    />
                    <StatTile
                        label="Distinct skills"
                        value={stats.distinctSkills}
                        detail={`from ${stats.homeworlds} ${stats.homeworlds === 1 ? 'homeworld' : 'homeworlds'}`}
                    />
                </div>

                <div className="dash-grid">
                    <section className="panel">
                        <h2 className="panel__title">Crew by department</h2>
                        <p className="panel__subtitle">Largest first. Select a row to open those crew members.</p>
                        <BarList
                            rows={stats.byDepartment}
                            total={stats.total}
                            getHref={(row) => crewListHref({ department: row.key })}
                        />
                    </section>

                    <section className="panel">
                        <h2 className="panel__title">Duty status</h2>
                        <p className="panel__subtitle">Who is working right now in {scopeLabel}.</p>
                        <StatusSplit
                            rows={stats.byStatus}
                            total={stats.total}
                            getHref={(row) => crewListHref({ department, status: row.key })}
                        />
                    </section>

                    <section className="panel">
                        <h2 className="panel__title">Clearance levels</h2>
                        <p className="panel__subtitle">Crew members per security clearance, 1 (lowest) to 5.</p>
                        <ClearanceColumns rows={stats.byClearance} />
                    </section>

                    <section className="panel">
                        <h2 className="panel__title">Newest aboard</h2>
                        <p className="panel__subtitle">The most recent arrivals.</p>
                        <ul className="mini-list">
                            {stats.newest.map((member) => (
                                <li key={member.id}>
                                    <CrewCard member={member} compact />
                                </li>
                            ))}
                        </ul>
                        <Link className="panel__link" to={crewListHref({ department })}>
                            All crew in {department || 'every department'} →
                        </Link>
                    </section>

                    <section className="panel">
                        <h2 className="panel__title">Senior officers</h2>
                        <p className="panel__subtitle">Clearance level 4 and above.</p>
                        {stats.senior.length ? (
                            <ul className="mini-list">
                                {stats.senior.map((member) => (
                                    <li key={member.id}>
                                        <CrewCard member={member} compact />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="muted">No senior officers in {scopeLabel}.</p>
                        )}
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <PageHeader
                eyebrow="Overview"
                title="Dashboard"
                subtitle={`Live statistics for ${scopeLabel}, calculated from the API response.`}
            >
                <button type="button" className="btn btn--ghost" onClick={reload}>
                    <svg className={`icon ${isLoading ? 'icon--spin' : ''}`} viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" />
                    </svg>
                    Reload
                </button>
                <Link to={crewListHref({ department })} className="btn btn--primary">
                    Open in roster
                </Link>
            </PageHeader>

            <div className="segmented" role="group" aria-label="Filter statistics by department">
                {['', ...DEPARTMENTS].map((value) => (
                    <button
                        key={value || 'all'}
                        type="button"
                        className="segmented__option"
                        aria-pressed={department === value}
                        onClick={() => selectDepartment(value)}
                    >
                        {value || 'All departments'}
                    </button>
                ))}
            </div>

            {renderContent()}
        </div>
    );
}
