import { useEffect, useState } from 'react';
import {
    applyNetworkPreset,
    createCrewMember,
    deleteItem,
    getItem,
    getItemsList,
    resetDatabase,
    updateItem,
} from './api/crewApi.js';
import { PAGE_SIZE } from './constants.js';
import Header from './components/Header.jsx';
import Toolbar from './components/Toolbar.jsx';
import CrewList from './components/CrewList.jsx';
import CrewDetails from './components/CrewDetails.jsx';
import CrewForm from './components/CrewForm.jsx';
import RequestLog from './components/RequestLog.jsx';
import Notice from './components/Notice.jsx';

// Lives outside the component on purpose: it only receives the state setter
// (which React keeps stable), so effects can call it without listing it as a dependency.
let logSeq = 0;
function addLog(setLog, label, outcome, startedAt) {
    const entry = { id: ++logSeq, label, outcome, ms: Date.now() - startedAt, at: new Date().toISOString() };
    setLog((prev) => [entry, ...prev].slice(0, 40));
}

function withoutKey(object, key) {
    const copy = { ...object };
    delete copy[key];
    return copy;
}

export default function App() {
    // ----- List -----
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [listStatus, setListStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [listError, setListError] = useState(null);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('name');
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);

    // ----- Selected item details -----
    const [selectedId, setSelectedId] = useState(null);
    const [details, setDetails] = useState(null);
    const [detailsStatus, setDetailsStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [detailsError, setDetailsError] = useState(null);
    const [detailsReloadKey, setDetailsReloadKey] = useState(0);

    // ----- Mutations and UI -----
    // id -> 'status' | 'save' | 'delete'. While an id is here, every other action on it is disabled.
    const [pending, setPending] = useState({});
    const [editor, setEditor] = useState(null); // null | { mode: 'create' } | { mode: 'edit', member }
    const [notice, setNotice] = useState(null);
    const [log, setLog] = useState([]);
    const [preset, setPreset] = useState('normal');

    // Sync an external system (the fake API config) with React state.
    // Declared first so it runs before the request effects below on mount.
    useEffect(() => {
        applyNetworkPreset(preset);
    }, [preset]);

    // Load the list. Runs again whenever the query changes or Reload is pressed.
    useEffect(() => {
        let ignore = false;
        const query = `?search=${encodeURIComponent(search.trim())}&sort=${sort}&page=${page}&limit=${PAGE_SIZE}`;
        const label = `GET /items${query}`;
        const startedAt = Date.now();

        setListStatus('loading');
        setListError(null);

        getItemsList(query)
            .then((result) => {
                if (ignore) {
                    // A newer request has started (typed again, changed page...). Drop this answer.
                    addLog(setLog, label, 'stale', startedAt);
                    return;
                }
                addLog(setLog, label, 'ok', startedAt);
                // The current page may no longer exist (e.g. last item on the last page was removed).
                if (result.totalPages > 0 && page > result.totalPages) {
                    setPage(result.totalPages);
                    return;
                }
                setItems(result.data);
                setTotal(result.total);
                setTotalPages(result.totalPages);
                setListStatus('success');
            })
            .catch((error) => {
                addLog(setLog, label, ignore ? 'stale' : 'error', startedAt);
                if (ignore) return;
                setListError(error.message);
                setListStatus('error');
            });

        // Cleanup runs before the next run of this effect and on unmount.
        return () => {
            ignore = true;
        };
    }, [search, sort, page, reloadKey]);

    // Load the selected item's full details.
    useEffect(() => {
        if (selectedId === null) {
            setDetails(null);
            setDetailsStatus('idle');
            return;
        }

        let ignore = false;
        const label = `GET /items/${selectedId}`;
        const startedAt = Date.now();

        // Clear immediately so the previous member's details are never shown under the new selection.
        setDetails(null);
        setDetailsStatus('loading');
        setDetailsError(null);

        getItem(selectedId)
            .then((member) => {
                if (ignore) {
                    addLog(setLog, label, 'stale', startedAt);
                    return;
                }
                addLog(setLog, label, 'ok', startedAt);
                setDetails(member);
                setDetailsStatus('success');
            })
            .catch((error) => {
                addLog(setLog, label, ignore ? 'stale' : 'error', startedAt);
                if (ignore) return;
                setDetailsError(error.message);
                setDetailsStatus('error');
            });

        return () => {
            ignore = true;
        };
    }, [selectedId, detailsReloadKey]);

    // Auto-hide the notice. Cleanup cancels the old timer when a new notice replaces it.
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(null), 4000);
        return () => clearTimeout(timer);
    }, [notice]);

    // ----- Helpers -----

    // Uses updater functions, so it always works on the latest state, never on
    // values captured when the request started.
    function applyUpdated(updated) {
        setItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        setDetails((prev) => (prev && prev.id === updated.id ? updated : prev));
    }

    function markPending(id, action) {
        setPending((prev) => ({ ...prev, [id]: action }));
    }

    function clearPending(id) {
        setPending((prev) => withoutKey(prev, id));
    }

    function reloadList() {
        setReloadKey((k) => k + 1);
    }

    // ----- Actions -----

    // `id` and `name` are captured when the action starts. Even if the user
    // selects someone else before the response arrives, the response updates
    // the member it was started for, and the details panel only changes if it
    // still shows that member.
    async function handleToggleDuty(member) {
        const id = member.id;
        const name = member.name;
        const nextStatus = member.status === 'on-duty' ? 'off-duty' : 'on-duty';
        const label = `PATCH /items/${id} status=${nextStatus}`;
        const startedAt = Date.now();

        markPending(id, 'status');
        try {
            const updated = await updateItem(id, { status: nextStatus, updatedAt: new Date().toISOString() });
            addLog(setLog, label, 'ok', startedAt);
            applyUpdated(updated);
            setNotice({ tone: 'success', text: `${name} is now ${nextStatus === 'on-duty' ? 'on duty' : 'off duty'}.` });
        } catch (error) {
            addLog(setLog, label, 'error', startedAt);
            setNotice({ tone: 'error', text: `Could not update ${name}: ${error.message}` });
        } finally {
            clearPending(id);
        }
    }

    async function handleDelete(member) {
        const id = member.id;
        const name = member.name;
        if (!window.confirm(`Remove ${name} from the roster?`)) return;
        const label = `DELETE /items/${id}`;
        const startedAt = Date.now();

        markPending(id, 'delete');
        try {
            await deleteItem(id);
            addLog(setLog, label, 'ok', startedAt);
            setItems((prev) => prev.filter((m) => m.id !== id));
            setSelectedId((prev) => (prev === id ? null : prev));
            setNotice({ tone: 'success', text: `${name} was removed.` });
            reloadList(); // totals and pages come from the server
        } catch (error) {
            addLog(setLog, label, 'error', startedAt);
            setNotice({ tone: 'error', text: `Could not remove ${name}: ${error.message}` });
        } finally {
            clearPending(id);
        }
    }

    // Errors are re-thrown so the form can show them and stay open.
    async function handleCreate(data) {
        const startedAt = Date.now();
        try {
            const created = await createCrewMember(data);
            addLog(setLog, 'POST /items + PATCH fields', 'ok', startedAt);
            setEditor(null);
            setSelectedId(created.id);
            setNotice({ tone: 'success', text: `${created.name} joined the crew.` });
            reloadList();
        } catch (error) {
            addLog(setLog, 'POST /items + PATCH fields', 'error', startedAt);
            throw error;
        }
    }

    async function handleSave(id, changes) {
        const label = `PATCH /items/${id}`;
        const startedAt = Date.now();
        markPending(id, 'save');
        try {
            const updated = await updateItem(id, { ...changes, updatedAt: new Date().toISOString() });
            addLog(setLog, label, 'ok', startedAt);
            applyUpdated(updated);
            setEditor(null);
            setNotice({ tone: 'success', text: `${updated.name} was saved.` });
            // Name changes can move the member to another position or page.
            reloadList();
        } catch (error) {
            addLog(setLog, label, 'error', startedAt);
            throw error;
        } finally {
            clearPending(id);
        }
    }

    function handleSearchChange(value) {
        setSearch(value);
        setPage(1);
    }

    function handleSortChange(value) {
        setSort(value);
        setPage(1);
    }

    function handleResetData() {
        if (!window.confirm('Restore the original crew? All changes will be lost.')) return;
        resetDatabase();
        setSelectedId(null);
        setSearch('');
        setPage(1);
        reloadList();
        setNotice({ tone: 'success', text: 'Crew data restored.' });
    }

    const selectedSummary = items.find((m) => m.id === selectedId) ?? null;

    return (
        <div className="page">
            <Header
                total={total}
                listStatus={listStatus}
                preset={preset}
                onPresetChange={setPreset}
                onResetData={handleResetData}
            />

            <div className="layout">
                <main className="panel panel--list">
                    <Toolbar
                        search={search}
                        onSearchChange={handleSearchChange}
                        sort={sort}
                        onSortChange={handleSortChange}
                        isLoading={listStatus === 'loading'}
                        onReload={reloadList}
                        onCreate={() => setEditor({ mode: 'create' })}
                    />
                    <CrewList
                        items={items}
                        status={listStatus}
                        error={listError}
                        search={search}
                        selectedId={selectedId}
                        pending={pending}
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        onSelect={setSelectedId}
                        onRetry={reloadList}
                        onPageChange={setPage}
                        onClearSearch={() => handleSearchChange('')}
                    />
                </main>

                <section className="panel panel--details" aria-live="polite">
                    <CrewDetails
                        selectedId={selectedId}
                        summary={selectedSummary}
                        details={details}
                        status={detailsStatus}
                        error={detailsError}
                        pendingAction={selectedId !== null ? pending[selectedId] : undefined}
                        onRetry={() => setDetailsReloadKey((k) => k + 1)}
                        onClose={() => setSelectedId(null)}
                        onToggleDuty={handleToggleDuty}
                        onEdit={(member) => setEditor({ mode: 'edit', member })}
                        onDelete={handleDelete}
                    />
                </section>
            </div>

            <RequestLog entries={log} onClear={() => setLog([])} />

            {editor && (
                <CrewForm
                    key={editor.mode === 'edit' ? editor.member.id : 'new'}
                    mode={editor.mode}
                    member={editor.mode === 'edit' ? editor.member : null}
                    onCreate={handleCreate}
                    onSave={handleSave}
                    onClose={() => setEditor(null)}
                />
            )}

            <Notice notice={notice} onDismiss={() => setNotice(null)} />
        </div>
    );
}
