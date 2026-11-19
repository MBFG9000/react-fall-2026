import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
    { to: '/', label: 'Home', end: true },
    { to: '/crew', label: 'Crew' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/about', label: 'About' },
];

const linkClass = ({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`;
const loginClass = ({ isActive }) => `btn btn--small nav__login ${isActive ? 'btn--primary' : 'btn--ghost'}`;

export default function NavBar() {
    const { pathname } = useLocation();
    const { user, loading, logout } = useAuth();
    // The mobile menu remembers which path it was opened on, so it closes by
    // itself after navigating (no effect needed).
    const [openOn, setOpenOn] = useState(null);
    const isOpen = openOn === pathname;

    return (
        <header className="nav">
            <div className="nav__inner">
                <Link to="/" className="nav__brand">
                    <svg className="nav__logo" viewBox="0 0 32 32" aria-hidden="true">
                        <circle cx="16" cy="16" r="13" />
                        <path d="M3 16h26M16 3c4 4 5.5 8.5 5.5 13S20 25 16 29M16 3c-4 4-5.5 8.5-5.5 13S12 25 16 29" />
                    </svg>
                    <span>Meridian Crew</span>
                </Link>

                <button
                    type="button"
                    className="nav__toggle"
                    aria-expanded={isOpen}
                    aria-controls="main-menu"
                    onClick={() => setOpenOn(isOpen ? null : pathname)}
                >
                    <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        {isOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                    </svg>
                </button>

                <nav id="main-menu" className={`nav__menu ${isOpen ? 'nav__menu--open' : ''}`} aria-label="Main">
                    <ul className="nav__links">
                        {LINKS.map((link) => (
                            <li key={link.to}>
                                <NavLink to={link.to} end={link.end} className={linkClass}>
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                    {/* Nothing while Firebase is still checking the session, so the buttons do not flicker. */}
                    {!loading && (
                        <div className="nav__auth">
                            {user ? (
                                <>
                                    <NavLink to="/profile" className={loginClass}>
                                        Profile
                                    </NavLink>
                                    <button type="button" className="btn btn--small btn--ghost nav__login" onClick={logout}>
                                        Log out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/login" className={loginClass}>
                                        Log in
                                    </NavLink>
                                    <NavLink to="/signup" className={loginClass}>
                                        Sign up
                                    </NavLink>
                                </>
                            )}
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
