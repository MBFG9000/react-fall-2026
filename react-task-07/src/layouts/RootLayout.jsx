import { Suspense, useEffect, useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import NavBar from '../components/NavBar.jsx';
import Notice from '../components/Notice.jsx';
import PageLoader from '../components/PageLoader.jsx';
import RequestLog from '../components/RequestLog.jsx';
import SimulatorPanel from '../components/SimulatorPanel.jsx';

// Shared shell for every page: navigation on top, the current page in the
// middle (<Outlet />), the fake-server tools at the bottom.
export default function RootLayout() {
    // The toast at the bottom. It lives here (not in a page) so a message such
    // as "X was removed" is still visible after redirecting to another page.
    const [notice, setNotice] = useState(null);

    // Goes up by one when "Reset data" is pressed. Pages list it in their
    // effect dependencies, so they load the data again.
    const [dataVersion, setDataVersion] = useState(0);

    // Request log (same as Task 04). Pages add entries with addLog(setLog, ...).
    const [log, setLog] = useState([]);

    // Auto-hide the notice. Cleanup cancels the old timer when a new notice replaces it.
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(null), 4000);
        return () => clearTimeout(timer);
    }, [notice]);

    function handleDataReset() {
        setDataVersion((v) => v + 1);
        setNotice({ tone: 'success', text: 'Crew data restored.' });
    }

    // Everything a page needs from the layout. Pages read it with useOutletContext().
    const outletContext = { notify: setNotice, setLog, dataVersion };

    return (
        <>
            <a className="skip-link" href="#content">
                Skip to content
            </a>
            <NavBar />

            <main id="content" className="page">
                {/* Lazy pages suspend here while their code downloads. */}
                <Suspense fallback={<PageLoader />}>
                    <Outlet context={outletContext} />
                </Suspense>
            </main>

            <footer className="footer">
                <div className="footer__inner">
                    <div className="footer__row">
                        <p className="footer__note">
                            Data comes from a simulated API with random delays and errors, stored in localStorage.
                        </p>
                        <SimulatorPanel onReset={handleDataReset} />
                    </div>
                    <RequestLog entries={log} onClear={() => setLog([])} />
                </div>
            </footer>

            <Notice notice={notice} onDismiss={() => setNotice(null)} />

            {/* Scroll to top on new pages, restore the position on Back/Forward. */}
            <ScrollRestoration />
        </>
    );
}
