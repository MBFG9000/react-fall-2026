import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';
import CrewCard from '../components/CrewCard.jsx';
import CrewFilters from '../components/CrewFilters.jsx';
import CrewForm from '../components/CrewForm.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import { CardGridSkeleton } from '../components/Skeletons.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { PAGE_SIZE } from '../constants.js';
import { createCrewMember } from '../features/crew/crewThunks.js';
import { noticeShown } from '../features/notifications/notificationsSlice.js';
import { useCrewList } from '../hooks/useCrewList.js';
import { buildCrewQuery } from '../services/crewApi.js';
import { countActiveFilters, parseCrewFilters, toSearchParams } from '../utils/crewFilters.js';
import { setPageTitle } from '../utils/pageTitle.js';

export default function CrewListPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // The URL is the single source of truth for search, filters, sort and page.
    // They are not copied into Redux: the query string built from them is the
    // key under which the store keeps this page of results.
    const [searchParams, setSearchParams] = useSearchParams();
    const filters = parseCrewFilters(searchParams);
    const { search, department, status, sort, page } = filters;
    const activeCount = countActiveFilters(filters);
    const query = buildCrewQuery({ search, department, status, sort, page, limit: PAGE_SIZE });

    // Loading, the result, errors and stale answers are handled by the hook + crew slice.
    const { result, status: listStatus, error, reload } = useCrewList(query);

    // Temporary UI state stays local.
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        setPageTitle('Crew');
    }, []);

    // ?page=9 when there are only 2 pages (old link, or the last member on
    // the last page was removed): go to the last real page instead.
    const lastPage = listStatus === 'success' ? result?.totalPages : 0;
    useEffect(() => {
        if (lastPage > 0 && page > lastPage) {
            setSearchParams((prev) => toSearchParams({ ...parseCrewFilters(prev), page: lastPage }), { replace: true });
        }
    }, [lastPage, page, setSearchParams]);

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

    // Errors are re-thrown on purpose (unwrap): CrewForm shows them and stays open.
    // After a create the crew slice raises its version, so every list and the
    // dashboard load again the next time they are shown.
    async function handleCreate(payload) {
        const created = await dispatch(createCrewMember(payload)).unwrap();
        setIsCreating(false);
        dispatch(noticeShown('success', `${created.name} joined the crew.`));
        navigate(`/crew/${created.id}`);
    }

    // Out of range: the effect above is about to switch to the last page.
    const isLoading = listStatus === 'loading' || (lastPage > 0 && page > lastPage);
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

        if (!isLoading && result.members.length === 0) {
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
                    {result.members.map((member) => (
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
