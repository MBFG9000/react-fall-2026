import Section from './Section.jsx';

export default function Contacts({ contacts }) {
    return (
        <Section id="contacts" title="Contacts">
            <ul className="contacts">
                {contacts.map((contact) => (
                    <li key={contact.label} className="contacts__item">
                        <span className="contacts__label">{contact.label}</span>
                        {contact.href ? (
                            <a href={contact.href} target="_blank" rel="noreferrer">{contact.value}</a>
                        ) : (
                            <span>{contact.value}</span>
                        )}
                    </li>
                ))}
            </ul>
        </Section>
    );
}
