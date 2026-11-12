import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router';
import CrewCard from '../components/CrewCard.jsx';
import CrewFilters from '../components/CrewFilters.jsx';
import CrewForm from '../components/CrewForm.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import { CardGridSkeleton } from '../components/Skeletons.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { PAGE_SIZE } from '../constants.js';
import { buildCrewQuery, clearCrewCache, createCrewMember, getCrewList } from '../services/service.js';
import { countActiveFilters, parseCrewFilters, toSearchParams } from '../utils/crewFilters.js';
import { setPageTitle } from '../utils/pageTitle.js';
import { addLog } from '../utils/requestLog.js';

export default function CrewListPage() {
    const navigate = useNavigate();
    const { notify, setLog, dataVersion } = useOutletContext();

    // The URL is the single source of truth for search, filters, sort and page.
    const [searchParams, setSearchParams] = useSearchParams();
    const filters = parseCrewFilters(searchParams);
    const { search, department, status, sort, page } = filters;
    const activeCount = countActiveFilters(filters);

    // ----- List state -----
    const [result, setResult] = useState(null); // { data, total, page, totalPages } from the API
    const [listStatus, setListStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0); // bumped by Reload / Try again
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        setPageTitle('Crew');
    }, []);

    /**
     * Merge `changes` into the URL. Changing anything but `page` goes back to
     * page 1. `replace` avoids a history entry per keystroke while typing;
     * other changes push one, so Back/Forward step through them.
     */
    function updateFilters(changes, { replace = false } = {}) {
        const changesPage = 'page' in changes;
        setSearchParams(
            (prev) => {
                const next = { ...parseCrewFilters(prev), ...changes };
                if (!changesPage) next.page = 1;
                return toSearchParams(next);
            },
            { replace, preventScrollReset: !changesPage },
        );
    }

    function resetFilters() {
        setSearchParams(new URLSearchParams(), { preventScrollReset: true });
    }

    // Load the list from the server whenever the query changes, on Reload,
    // and after "Reset data". All filtering happens in the fake API.
    useEffect(() => {
        let ignore = false;
        const query = buildCrewQuery({ search, department, status, sort, page, limit: PAGE_SIZE });
        const label = `GET /items${query}`;
        const startedAt = Date.now();

        setListStatus('loading'); // the old cards stay visible (dimmed) until the answer arrives
        setError(null);

        getCrewList(query)
            .then((response) => {
                if (ignore) {
                    // A newer request has started (typed again, changed a filter...). Drop this answer.
                    addLog(setLog, label, 'stale', startedAt);
                    return;
                }
                addLog(setLog, label, 'ok', startedAt);
                // ?page=9 when there are only 2 pages (old link, or the last member on
                // the last page was removed): go to the last real page instead.
                if (response.totalPages > 0 && page > response.totalPages) {
                    setSearchParams(
                        (prev) => toSearchParams({ ...parseCrewFilters(prev), page: response.totalPages }),
                        { replace: true },
                    );
                    return;
                }
                setResult(response);
                setListStatus('success');
            })
            .catch((err) => {
                addLog(setLog, label, ignore ? 'stale' : 'error', startedAt);
                if (ignore) return;
                setError(err);
                setListStatus('error');
            });

        // Cleanup runs before the next run of this effect and when leaving the page.
        return () => {
            ignore = true;
        };
    }, [search, department, status, sort, page, reloadKey, dataVersion, setSearchParams, setLog]);

    // Reload skips the cache: forget the saved answers, then run the effect again.
    function reload() {
        clearCrewCache();
        setReloadKey((k) => k + 1);
    }

    // Errors are re-thrown on purpose: CrewForm shows them and stays open.
    async function handleCreate(payload) {
        const startedAt = Date.now();
        try {
            const created = await createCrewMember(payload);
            addLog(setLog, 'POST /items + PATCH fields', 'ok', startedAt);
            setIsCreating(false);
            notify({ tone: 'success', text: `${created.name} joined the crew.` });
            navigate(`/crew/${created.id}`);
        } catch (err) {
            addLog(setLog, 'POST /items + PATCH fields', 'error', startedAt);
            throw err;
        }
    }

    const isLoading = listStatus === 'loading';
    const total = result?.total ?? 0;

    function renderContent() {
        // First load: nothing to show yet.
        if (isLoading && !result) {
            return (
                <div role="status">
                    <p className="sr-only">Loading crew…</p>
                    <CardGridSkeleton />
                </div>
            );
        }

        if (listStatus === 'error') {
            return (
                <StateMessage tone="error" title="Could not load the crew list" text={error.message}>
                    <button type="button" className="btn btn--primary" onClick={reload}>
                        Try again
                    </button>
                </StateMessage>
            );
        }

        if (!isLoading && result.data.length === 0) {
            return activeCount > 0 ? (
                <StateMessage
                    title="No crew members match these filters"
                    text="Try a different search, or clear the filters to see everyone."
                >
                    <button type="button" className="btn btn--ghost" onClick={resetFilters}>
                        Clear filters
                    </button>
                </StateMessage>
            ) : (
                <StateMessage title="The roster is empty" text="Add the first crew member to get started.">
                    <button type="button" className="btn btn--primary" onClick={() => setIsCreating(true)}>
                        + New member
                    </button>
                </StateMessage>
            );
        }

        // Success, or loading new results while still showing the previous ones.
        return (
            <div className={`list-wrap ${isLoading ? 'list-wrap--refreshing' : ''}`} aria-busy={isLoading}>
                {isLoading && (
                    <div className="refresh-bar" role="status">
                        Updating results…
                    </div>
                )}

                <ul className="card-grid">
                    {result.data.map((member) => (
                        <li key={member.id}>
                            <CrewCard member={member} />
                        </li>
                    ))}
                </ul>

                <Pagination
                    page={result.page}
                    totalPages={result.totalPages}
                    total={total}
                    onPageChange={(nextPage) => updateFilters({ page: nextPage })}
                />
            </div>
        );
    }

    return (
        <div className="crew-page">
            <PageHeader
                eyebrow="Roster"
                title="Crew"
                subtitle={
                    listStatus === 'success'
                        ? `${total} ${total === 1 ? 'crew member matches' : 'crew members match'} the current view`
                        : 'Personnel records of the research vessel Meridian'
                }
            >
                <button type="button" className="btn btn--ghost" onClick={reload} title="Fetch the list again">
                    <svg className={`icon ${isLoading ? 'icon--spin' : ''}`} viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" />
                    </svg>
                    Reload
                </button>
                <button type="button" className="btn btn--primary" onClick={() => setIsCreating(true)}>
                    + New member
                </button>
            </PageHeader>

            <section className="panel">
                <CrewFilters
                    filters={filters}
                    activeCount={activeCount}
                    onChange={updateFilters}
                    onReset={resetFilters}
                />
                {renderContent()}
            </section>

            {isCreating && <CrewForm mode="create" member={null} onCreate={handleCreate} onClose={() => setIsCreating(false)} />}
        </div>
    );
}
