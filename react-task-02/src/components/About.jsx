import Section from './Section.jsx';

export default function About({ paragraphs, facts }) {
    return (
        <Section id="about" title="About Me">
            {paragraphs.map((text) => (
                <p key={text} className="about__text">{text}</p>
            ))}
            <ul className="facts">
                {facts.map((fact) => (
                    <li key={fact.label} className="facts__item">
                        <span className="facts__label">{fact.label}</span>
                        <span className="facts__value">{fact.value}</span>
                    </li>
                ))}
            </ul>
        </Section>
    );
}
