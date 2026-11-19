import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import PageLoader from './PageLoader.jsx';

// Wraps a page that needs a signed-in user.
export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    // Firebase has not restored the session yet: wait instead of redirecting too early.
    if (loading) return <PageLoader />;

    if (!user) return <Navigate to="/login" replace />;

    return children;
}
