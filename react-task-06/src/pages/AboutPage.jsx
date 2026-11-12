import { useEffect } from 'react';
import { Link } from 'react-router';
import PageHeader from '../components/PageHeader.jsx';
import { setPageTitle } from '../utils/pageTitle.js';

const ROUTES = [
    ['/', 'Home', 'Introduction and links'],
    ['/about', 'About', 'This page (lazy)'],
    ['/crew', 'Crew roster', 'Search, filters, sort, pagination in the URL (lazy)'],
    ['/crew/:crewId', 'Crew member', 'Full record loaded by id (lazy)'],
    ['/dashboard', 'Dashboard', 'Statistics from API data (lazy)'],
    ['/login', 'Log in', 'Email/password and Google sign-in (lazy)'],
    ['/signup', 'Sign up', 'New account with email and password (lazy)'],
    ['/profile', 'Profile', 'Signed-in users only: email, UID, log out (lazy)'],
    ['*', 'Not found', 'Any other address'],
];

const FOLDERS = [
    ['layouts/', 'RootLayout: NavBar, <Outlet />, Suspense, notices, footer tools'],
    ['pages/', 'One component per route'],
    ['components/', 'Reusable UI: CrewCard, CrewFilters, Pagination, StateMessage…'],
    ['api/', 'The course fake API, its settings and the seed crew (as in Task 04)'],
    ['context/', 'AuthContext: AuthProvider and useAuth (Firebase Authentication)'],
    ['services/', 'service.js: every API request the pages make; cache.js: the response cache'],
    ['utils/', 'URL filters, page titles, formatting, dashboard statistics'],
    ['styles/', 'Design tokens, layout, components, pages'],
];

export default function AboutPage() {
    useEffect(() => {
        setPageTitle('About');
    }, []);

    return (
        <div className="about">
            <PageHeader
                eyebrow="About"
                title="About this project"
                subtitle="Task 06 of the React Fall 2026 course: server data caching and Firebase Authentication."
            >
                <Link to="/crew" className="btn btn--primary">
                    Go to the crew roster
                </Link>
            </PageHeader>

            <div className="about__grid">
                <section className="panel prose">
                    <h2>What it is</h2>
                    <p>
                        Meridian Crew is the personnel roster of a fictional research vessel. It started in Task 04 as a
                        single screen that loaded crew members from a simulated API. In this task it became a full
                        single-page app with its own address for every view.
                    </p>
                    <p>
                        All data comes from the course&apos;s fake API: requests return Promises, take 0.5 to 3 seconds,
                        fail at random, and store their data in <code>localStorage</code>. Search, filters, sorting and
                        pagination are sent to it as query parameters. The browser never filters the list itself; the
                        API only got two extra filters (department and status) at its &quot;add other filter fields
                        here&quot; spot.
                    </p>

                    <h2>How it works</h2>
                    <ul>
                        <li>
                            <strong>Routing.</strong> React Router with nested routes under one <code>RootLayout</code>.
                            Links use client-side navigation, so the page never fully reloads.
                        </li>
                        <li>
                            <strong>State in the URL.</strong> Roster filters live in the query string (
                            <code>useSearchParams</code>), so a filtered view can be bookmarked, shared, refreshed, and
                            stepped through with Back and Forward.
                        </li>
                        <li>
                            <strong>Stale requests.</strong> Each request effect has its own{' '}
                            <code>let ignore = false</code>, and the cleanup sets it to <code>true</code>. When the
                            user moves on, the old response is dropped and shows up as <em>Ignored (stale)</em> in the
                            request log at the bottom of each page.
                        </li>
                        <li>
                            <strong>Lazy loading.</strong> Seven pages are loaded with <code>React.lazy</code> and{' '}
                            <code>Suspense</code>, each in its own chunk.
                        </li>
                        <li>
                            <strong>Caching.</strong> API answers are kept in memory for 60 seconds, so going back to a
                            page shows it at once. Any change to the crew clears the cache.
                        </li>
                        <li>
                            <strong>Authentication.</strong> Firebase email/password and Google sign-in. The session
                            survives a refresh, and <code>/profile</code> is only for signed-in users.
                        </li>
                        <li>
                            <strong>Basic hooks.</strong> Components use <code>useState</code> and{' '}
                            <code>useEffect</code>, plus the React Router hooks and <code>useAuth</code> (a small
                            hook over <code>useContext</code>). Every page loads its own data in an effect through{' '}
                            <code>services/</code>.
                        </li>
                    </ul>
                </section>

                <aside className="about__side">
                    <section className="panel">
                        <h2 className="panel__title">Routes</h2>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">Path</th>
                                    <th scope="col">Page</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ROUTES.map(([path, name, note]) => (
                                    <tr key={path}>
                                        <td>
                                            <code>{path}</code>
                                        </td>
                                        <td>
                                            {name}
                                            <span className="table__note">{note}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className="panel about__stack">
                        <h2 className="panel__title">Built with</h2>
                        <ul className="chips">
                            {['React 19', 'React Router 8', 'Firebase Auth', 'Vite 8', 'Plain CSS', 'GitHub Pages'].map((tool) => (
                                <li key={tool} className="chip">
                                    {tool}
                                </li>
                            ))}
                        </ul>
                        <p className="muted about__author">
                            Made by MBFG9000 for React Fall 2026. More about the author on the{' '}
                            <a href="https://mbfg9000.github.io/react-fall-2026/react-task-02/">About Me page</a> from
                            Task 02.
                        </p>
                    </section>
                </aside>

                <section className="panel about__folders">
                    <h2 className="panel__title">Source folders</h2>
                    <dl className="folder-list">
                        {FOLDERS.map(([folder, text]) => (
                            <div key={folder}>
                                <dt>
                                    <code>src/{folder}</code>
                                </dt>
                                <dd>{text}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            </div>
        </div>
    );
}
