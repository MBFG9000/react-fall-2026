import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import ClearanceMeter from '../components/ClearanceMeter.jsx';
import CrewForm from '../components/CrewForm.jsx';
import { DetailsSkeleton } from '../components/Skeletons.jsx';
import StateMessage from '../components/StateMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { deleteCrewMember, updateCrewMember } from '../features/crew/crewThunks.js';
import { noticeShown } from '../features/notifications/notificationsSlice.js';
import { useCrewMember } from '../hooks/useCrewMember.js';
import { crewListHref, parseCrewId } from '../utils/crewFilters.js';
import { formatDate, formatDateTime, formatServiceLength, initials } from '../utils/format.js';
import { setPageTitle } from '../utils/pageTitle.js';

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
    const dispatch = useDispatch();

    // The member, the request state and the running mutation all come from the
    // crew slice, keyed by id. So the page can never show member #1 under /crew/2,
    // and a "Saving…" button belongs to the member it was pressed for.
    const { member, status, error, pendingAction, retry } = useCrewMember(id);

    // Which member the edit form is open for (temporary UI state, stays local).
    const [editingId, setEditingId] = useState(null);

    const isEditing = editingId !== null && editingId === id;
    const isNotFound = id === null || status === 'not-found';
    const memberName = member?.name;

    useEffect(() => {
        setPageTitle(memberName ?? (isNotFound ? 'Crew member not found' : 'Crew member'));
    }, [memberName, isNotFound]);

    // ----- Actions -----
    // `memberId` and `name` are captured when the action starts, so messages
    // name the member the action was started for. After every change the crew
    // slice stores the server's answer and raises its version, so the roster
    // and the dashboard load again when they are shown.

    async function handleToggleDuty() {
        const { id: memberId, name } = member;
        const nextStatus = member.status === 'on-duty' ? 'off-duty' : 'on-duty';
        try {
            await dispatch(updateCrewMember({ id: memberId, changes: { status: nextStatus }, action: 'status' })).unwrap();
            dispatch(noticeShown('success', `${name} is now ${nextStatus === 'on-duty' ? 'on duty' : 'off duty'}.`));
        } catch (err) {
            dispatch(noticeShown('error', `Could not update ${name}: ${err.message}`));
        }
    }

    // Errors are re-thrown on purpose (unwrap): CrewForm shows them and stays open.
    async function handleSave(memberId, changes) {
        const updated = await dispatch(updateCrewMember({ id: memberId, changes, action: 'save' })).unwrap();
        setEditingId(null);
        dispatch(noticeShown('success', `${updated.name} was saved.`));
    }

    async function handleDelete() {
        const { id: memberId, name } = member;
        if (!window.confirm(`Remove ${name} from the roster?`)) return;
        try {
            await dispatch(deleteCrewMember({ id: memberId })).unwrap();
            dispatch(noticeShown('success', `${name} was removed.`));
            // Replace: going Back must not land on the removed member's page.
            navigate(location.state?.from ?? crewListHref(), { replace: true });
        } catch (err) {
            dispatch(noticeShown('error', `Could not remove ${name}: ${err.message}`));
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

        if (status === 'error' && !member) {
            return (
                <StateMessage tone="error" title="Could not load this record" text={error.message}>
                    <button type="button" className="btn btn--primary" onClick={retry}>
                        Try again
                    </button>
                    <Link to="/crew" className="btn btn--ghost">
                        All crew
                    </Link>
                </StateMessage>
            );
        }

        // Still loading and the member is not in the store yet (e.g. a direct link).
        // Opened from the roster, the member is already there and shown at once.
        if (!member) {
            return (
                <div role="status">
                    <p className="state__text">Loading record #{id}…</p>
                    <DetailsSkeleton />
                </div>
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
