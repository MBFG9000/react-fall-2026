import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// StrictMode is on: in development React mounts every component, unmounts it
// and mounts it again. That runs each effect, its cleanup, and the effect again,
// which checks that the cleanups really work (the first request of each effect
// shows up as "Ignored (stale)" in the request log in dev builds only).
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
