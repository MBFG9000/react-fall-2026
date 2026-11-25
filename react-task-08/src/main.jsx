import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { store } from './store/index.js';
import './styles/index.css';

// StrictMode is on: in development React mounts every component, unmounts it
// and mounts it again. That runs each effect, its cleanup, and the effect again,
// which checks that the cleanups really work (the first request of each page is
// aborted and shows up as "Ignored (stale)" in the request log in dev builds only).
createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* Every component can read the Redux store with useSelector and change it with useDispatch. */}
        <Provider store={store}>
            {/* Every page and the NavBar can read the signed-in user with useAuth(). */}
            <AuthProvider>
                <App />
            </AuthProvider>
        </Provider>
    </StrictMode>,
);
