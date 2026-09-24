export default function Section({ id, title, children }) {
    return (
        <section className="section card" id={id}>
            <h2 className="section__title">{title}</h2>
            {children}
        </section>
    );
}
