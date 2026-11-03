import { useEffect } from 'react';
import { Link } from 'react-router';
import vesselImage from '../assets/meridian-vessel.svg';
import { setPageTitle } from '../utils/pageTitle.js';

const SECTIONS = [
    {
        to: '/crew',
        title: 'Crew roster',
        text: 'Search, filter and sort everyone on board. Open a profile to see the full record.',
    },
    {
        to: '/dashboard',
        title: 'Dashboard',
        text: 'Live numbers about the crew: who is on duty, departments, clearance levels.',
    },
    {
        to: '/about',
        title: 'About the project',
        text: 'How this app is built: routing, data flow, lazy loading, and the simulated API.',
    },
];

export default function HomePage() {
    useEffect(() => {
        setPageTitle('Home');
    }, []);

    return (
        <div className="home">
            <section className="hero">
                <div className="hero__text">
                    <p className="eyebrow">Research vessel Meridian</p>
                    <h1 className="hero__title">Everyone on board, in one place.</h1>
                    <p className="hero__lead">
                        Meridian Crew keeps the personnel records for a deep-space survey ship. Find a crew
                        member, check who is on duty, update a record, or see how the departments are staffed.
                    </p>
                    <div className="hero__actions">
                        <Link to="/crew" className="btn btn--primary">
                            Browse the crew
                        </Link>
                        <Link to="/dashboard" className="btn btn--ghost">
                            Open dashboard
                        </Link>
                    </div>
                </div>
                <img
                    className="hero__image"
                    src={vesselImage}
                    alt="The research vessel Meridian passing a ringed planet"
                    width="640"
                    height="420"
                />
            </section>

            <section aria-labelledby="explore-title">
                <h2 id="explore-title" className="section-title">
                    Explore
                </h2>
                <ul className="link-cards">
                    {SECTIONS.map((section) => (
                        <li key={section.to}>
                            <Link to={section.to} className="link-card">
                                <span className="link-card__title">{section.title}</span>
                                <span className="link-card__text">{section.text}</span>
                                <span className="link-card__arrow" aria-hidden="true">
                                    →
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
