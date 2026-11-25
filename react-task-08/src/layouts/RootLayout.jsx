import { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import NavBar from '../components/NavBar.jsx';
import Notice from '../components/Notice.jsx';
import PageLoader from '../components/PageLoader.jsx';
import RequestLog from '../components/RequestLog.jsx';
import SimulatorPanel from '../components/SimulatorPanel.jsx';
import UpdateBanner from '../components/UpdateBanner.jsx';
import { noticeDismissed, selectNotice } from '../features/notifications/notificationsSlice.js';

// Shared shell for every page: navigation on top, the current page in the
// middle (<Outlet />), the fake-server tools at the bottom.
// The data pages used to share through <Outlet context> (notify, setLog,
// dataVersion) now lives in the Redux store, so pages read it themselves.
export default function RootLayout() {
    const dispatch = useDispatch();
    // The toast at the bottom (notifications slice). Pages show it with
    // dispatch(noticeShown(...)), and it is still visible after a redirect.
    const notice = useSelector(selectNotice);

    // Tell the Service Worker which page is shown, so it can open it offline
    // later (router navigations do not reach the Service Worker by themselves).
    const { pathname } = useLocation();
    useEffect(() => {
        navigator.serviceWorker?.controller?.postMessage({ type: 'PAGE_VISITED', path: pathname });
    }, [pathname]);

    // Auto-hide the notice. Cleanup cancels the old timer when a new notice replaces it.
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => dispatch(noticeDismissed()), 4000);
        return () => clearTimeout(timer);
    }, [notice, dispatch]);

    return (
        <>
            <a className="skip-link" href="#content">
                Skip to content
            </a>
            <NavBar />
            {/* Registers the Service Worker; shows "new version available" with an Update button. */}
            <UpdateBanner />

            <main id="content" className="page">
                {/* Lazy pages suspend here while their code downloads. */}
                <Suspense fallback={<PageLoader />}>
                    <Outlet />
                </Suspense>
            </main>

            <footer className="footer">
                <div className="footer__inner">
                    <div className="footer__row">
                        <p className="footer__note">
                            Data comes from a simulated API with random delays and errors, stored in localStorage.
                        </p>
                        <SimulatorPanel />
                    </div>
                    <RequestLog />
                </div>
            </footer>

            <Notice notice={notice} onDismiss={() => dispatch(noticeDismissed())} />

            {/* Scroll to top on new pages, restore the position on Back/Forward. */}
            <ScrollRestoration />
        </>
    );
}
