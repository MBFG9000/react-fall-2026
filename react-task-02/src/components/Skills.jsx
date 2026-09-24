import { useState } from 'react';
import Section from './Section.jsx';

export default function Skills({ skills }) {
    const [active, setActive] = useState(null);

    return (
        <Section id="skills" title="Skills">
            <ul className="skills">
                {skills.map((skill) => (
                    <li key={skill}>
                        <button
                            type="button"
                            className={`chip ${active === skill ? 'chip--active' : ''}`}
                            onClick={() => setActive(active === skill ? null : skill)}
                        >
                            {skill}
                        </button>
                    </li>
                ))}
            </ul>
            <p className="skills__hint">
                {active ? `Yes, I really do ${active}. 🚀` : 'Click a skill to highlight it.'}
            </p>
        </Section>
    );
}
