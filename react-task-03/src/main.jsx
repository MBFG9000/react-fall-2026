import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// StrictMode is intentionally not used here: in development it renders every
// component twice, which would double every console.log and make the
// re-render investigation harder to follow during the defence.
createRoot(document.getElementById('root')).render(<App />);
