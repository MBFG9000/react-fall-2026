import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RootLayout from './layouts/RootLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RouteErrorPage from './pages/RouteErrorPage.jsx';

// Lazy pages: each becomes its own JS chunk, downloaded the first time the
// route is visited. The <Suspense> in RootLayout shows a loader meanwhile.
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const CrewListPage = lazy(() => import('./pages/CrewListPage.jsx'));
const CrewDetailsPage = lazy(() => import('./pages/CrewDetailsPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const SignupPage = lazy(() => import('./pages/SignupPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <RootLayout />,
            children: [
                {
                    // Pathless route: a crash inside any page renders the error page
                    // inside the layout, so the navigation bar stays usable.
                    errorElement: <RouteErrorPage />,
                    children: [
                        { index: true, element: <HomePage /> },
                        { path: 'about', element: <AboutPage /> },
                        {
                            path: 'crew',
                            children: [
                                { index: true, element: <CrewListPage /> },
                                { path: ':crewId', element: <CrewDetailsPage /> },
                            ],
                        },
                        { path: 'dashboard', element: <DashboardPage /> },
                        { path: 'login', element: <LoginPage /> },
                        { path: 'signup', element: <SignupPage /> },
                        {
                            path: 'profile',
                            element: (
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            ),
                        },
                        { path: '*', element: <NotFoundPage /> },
                    ],
                },
            ],
        },
    ],
    // Vite's base path (e.g. /react-fall-2026/react-task-06/ on GitHub Pages).
    { basename: import.meta.env.BASE_URL },
);

export default function App() {
    return <RouterProvider router={router} />;
}
