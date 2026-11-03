import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router';
import ClearanceMeter from '../components/ClearanceMeter.jsx';
import CrewForm from '../components/CrewForm.jsx';
import { DetailsSkeleton } from '../components/Skeletons.jsx';
import StateMessage from '../components/StateMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { deleteCrewMember, getCrewMember, isNotFoundError, updateCrewMember } from '../services/service.js';
import { crewListHref, parseCrewId } from '../utils/crewFilters.js';
import { formatDate, formatDateTime, formatServiceLength, initials } from '../utils/format.js';
import { setPageTitle } from '../utils/pageTitle.js';
import { addLog } from '../utils/requestLog.js';

function BackLinks() {
    const navigate = useNavigate();
    const location = useLocation();
    // location.key is 'default' when this is the first page of the visit
    // (direct URL or refresh). Then there is no in-app page to go back to.
    const canGoBack = location.key !== 'default';

    return (
        <nav className="back-links" aria-label="Back">
            <button type="button" className="btn btn--ghost btn--small" onClick={() => (canGoBack ? navigate(-1) : navigate('/crew'))}>
                ← Back
            </button>
            <Link to="/crew" className="btn btn--ghost btn--small">
                All crew
            </Link>
        </nav>
    );
}

function NotFoundCard({ title, text }) {
    return (
        <StateMessage tone="warning" title={title} text={text}>
            <Link to="/crew" className="btn btn--primary">
                All crew
            </Link>
            <Link to="/" className="btn btn--ghost">
                Home
            </Link>
        </StateMessage>
    );
}

export default function CrewDetailsPage() {
    const { crewId } = useParams();
    const id = parseCrewId(crewId); // null when the URL has something like /crew/abc
    const location = useLocation();
    const navigate = useNavigate();
    const { notify, setLog, dataVersion } = useOutletContext();

    // Result of the last request, together with the id it was made for.
    // status: 'loading' | 'success' | 'not-found' | 'error'
    const [request, setRequest] = useState({ id: null, status: 'loading', member: null, error: null });
    const [reloadKey, setReloadKey] = useState(0); // bumped by "Try again"

    // { id, action } of the update in flight. Tied to an id, so it never
    // blocks a different member if the URL changes while it is running.
    const [pending, setPending] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Load the member whenever the id in the URL changes, on "Try again", and after "Reset data".
    useEffect(() => {
        if (id === null) return; // invalid id: nothing to load

        let ignore = false;
        const label = `GET /items/${id}`;
        const startedAt = Date.now();

        // Clear immediately so the previous member is never shown under the new id.
        setRequest({ id, status: 'loading', member: null, error: null });

        getCrewMember(id)
            .then((member) => {
                if (ignore) {
                    // The user opened another member before this answer came. Drop it.
                    addLog(setLog, label, 'stale', startedAt);
                    return;
                }
                addLog(setLog, label, 'ok', startedAt);
                setRequest({ id, status: 'success', member, error: null });
            })
            .catch((err) => {
                addLog(setLog, label, ignore ? 'stale' : 'error', startedAt);
                if (ignore) return;
                setRequest({ id, status: isNotFoundError(err) ? 'not-found' : 'error', member: null, error: err });
            });

        return () => {
            ignore = true;
        };
    }, [id, reloadKey, dataVersion, setLog]);

    // Right after the URL changes (/crew/1 -> /crew/2) the effect has not run
    // yet and `request` still describes #1. Treat that moment as loading.
    const isCurrent = request.id === id;
    const status = isCurrent ? request.status : 'loading';
    const member = isCurrent ? request.member : null;
    const error = isCurrent ? request.error : null;

    const pendingAction = pending?.id === id ? pending.action : null;
    const isEditing = editingId !== null && editingId === id;
    const isNotFound = id === null || status === 'not-found';
    const memberName = member?.name;

    useEffect(() => {
        setPageTitle(memberName ?? (isNotFound ? 'Crew member not found' : 'Crew member'));
    }, [memberName, isNotFound]);

    // Put the server's answer on screen, but only if this page still shows
    // that member (the user may have moved on while the request was running).
    function showUpdated(updated) {
        setRequest((prev) => (prev.id === updated.id && prev.member ? { ...prev, member: updated } : prev));
    }

    // ----- Actions -----
    // `memberId` and `name` are captured when the action starts, so the
    // response is applied to the member the action was started for.

    async function handleToggleDuty() {
        const { id: memberId, name } = member;
        const nextStatus = member.status === 'on-duty' ? 'off-duty' : 'on-duty';
        const label = `PATCH /items/${memberId} status=${nextStatus}`;
        const startedAt = Date.now();
        setPending({ id: memberId, action: 'status' });
        try {
            const updated = await updateCrewMember(memberId, { status: nextStatus });
            addLog(setLog, label, 'ok', startedAt);
            showUpdated(updated);
            notify({ tone: 'success', text: `${name} is now ${nextStatus === 'on-duty' ? 'on duty' : 'off duty'}.` });
        } catch (err) {
            addLog(setLog, label, 'error', startedAt);
            notify({ tone: 'error', text: `Could not update ${name}: ${err.message}` });
        } finally {
            setPending(null);
        }
    }

    // Errors are re-thrown on purpose: CrewForm shows them and stays open.
    async function handleSave(memberId, changes) {
        const label = `PATCH /items/${memberId}`;
        const startedAt = Date.now();
        setPending({ id: memberId, action: 'save' });
        try {
            const updated = await updateCrewMember(memberId, changes);
            addLog(setLog, label, 'ok', startedAt);
            showUpdated(updated);
            setEditingId(null);
            notify({ tone: 'success', text: `${updated.name} was saved.` });
        } catch (err) {
            addLog(setLog, label, 'error', startedAt);
            throw err;
        } finally {
            setPending(null);
        }
    }

    async function handleDelete() {
        const { id: memberId, name } = member;
        if (!window.confirm(`Remove ${name} from the roster?`)) return;
        const label = `DELETE /items/${memberId}`;
        const startedAt = Date.now();
        setPending({ id: memberId, action: 'delete' });
        try {
            await deleteCrewMember(memberId);
            addLog(setLog, label, 'ok', startedAt);
            notify({ tone: 'success', text: `${name} was removed.` });
            // Replace: going Back must not land on the removed member's page.
            navigate(location.state?.from ?? crewListHref(), { replace: true });
        } catch (err) {
            addLog(setLog, label, 'error', startedAt);
            notify({ tone: 'error', text: `Could not remove ${name}: ${err.message}` });
            setPending(null);
        }
    }

    // ----- Render -----

    function renderContent() {
        if (id === null) {
            return <NotFoundCard title="Invalid crew ID" text={`“${crewId}” is not a valid crew ID. IDs are positive whole numbers.`} />;
        }

        if (isNotFound) {
            return (
                <NotFoundCard
                    title="Crew member not found"
                    text={`Nobody with ID #${id} is on the roster. They may have been removed.`}
                />
            );
        }

        if (status === 'loading') {
            return (
                <div role="status">
                    <p className="state__text">Loading record #{id}…</p>
                    <DetailsSkeleton />
                </div>
            );
        }

        if (status === 'error') {
            return (
                <StateMessage tone="error" title="Could not load this record" text={error.message}>
                    <button type="button" className="btn btn--primary" onClick={() => setReloadKey((k) => k + 1)}>
                        Try again
                    </button>
                    <Link to="/crew" className="btn btn--ghost">
                        All crew
                    </Link>
                </StateMessage>
            );
        }

        const isBusy = Boolean(pendingAction);
        const isOnDuty = member.status === 'on-duty';

        return (
            <article className="details">
                <header className="details__head">
                    <span className={`avatar avatar--large avatar--${member.department?.toLowerCase() ?? 'none'}`} aria-hidden="true">
                        {initials(member.name)}
                    </span>
                    <div>
                        <p className="details__eyebrow">
                            #{member.id} · {member.callsign || 'No callsign'}
                        </p>
                        <h1 className="details__name">{member.name}</h1>
                        <p className="details__role">{member.description}</p>
                    </div>
                </header>

                <div className="duty">
                    <StatusBadge status={member.status} large />
                    <button
                        type="button"
                        className={`btn ${isOnDuty ? 'btn--ghost' : 'btn--primary'}`}
                        disabled={isBusy}
                        onClick={handleToggleDuty}
                    >
                        {pendingAction === 'status' ? 'Updating…' : isOnDuty ? 'Stand down' : 'Report for duty'}
                    </button>
                </div>

                <dl className="facts">
                    <div>
                        <dt>Department</dt>
                        <dd>
                            {member.department ? (
                                <Link to={crewListHref({ department: member.department })}>{member.department}</Link>
                            ) : (
                                '—'
                            )}
                        </dd>
                    </div>
                    <div>
                        <dt>Homeworld</dt>
                        <dd>{member.homeworld || '—'}</dd>
                    </div>
                    <div>
                        <dt>Clearance</dt>
                        <dd>{member.clearance ? <ClearanceMeter level={member.clearance} /> : '—'}</dd>
                    </div>
                    <div>
                        <dt>Callsign</dt>
                        <dd className="mono">{member.callsign || '—'}</dd>
                    </div>
                    <div>
                        <dt>Joined</dt>
                        <dd>{formatDate(member.joinedAt)}</dd>
                    </div>
                    <div>
                        <dt>Time aboard</dt>
                        <dd>{formatServiceLength(member.joinedAt)}</dd>
                    </div>
                </dl>

                <section className="details__section">
                    <h2 className="details__label">Skills</h2>
                    {member.skills?.length ? (
                        <ul className="chips">
                            {member.skills.map((skill) => (
                                <li key={skill} className="chip">
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="muted">No skills listed.</p>
                    )}
                </section>

                <section className="details__section">
                    <h2 className="details__label">Bio</h2>
                    <p className="details__bio">{member.bio || 'No bio yet.'}</p>
                </section>

                <p className="details__updated">Last updated {formatDateTime(member.updatedAt)}</p>

                <div className="details__actions">
                    <button type="button" className="btn btn--ghost" disabled={isBusy} onClick={() => setEditingId(member.id)}>
                        {pendingAction === 'save' ? 'Saving…' : 'Edit'}
                    </button>
                    <button type="button" className="btn btn--danger" disabled={isBusy} onClick={handleDelete}>
                        {pendingAction === 'delete' ? 'Removing…' : 'Remove'}
                    </button>
                </div>

                {isEditing && (
                    <CrewForm
                        key={member.id}
                        mode="edit"
                        member={member}
                        onSave={handleSave}
                        onClose={() => setEditingId(null)}
                    />
                )}
            </article>
        );
    }

    return (
        <div className="details-page">
            <BackLinks />
            <section className="panel details-panel" aria-live="polite">
                {renderContent()}
            </section>
        </div>
    );
}
