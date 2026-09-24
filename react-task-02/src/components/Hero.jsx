export default function Hero({ name, role, tagline, avatar }) {
    return (
        <section className="hero" id="top">
            <div className="hero__avatar">
                <img src={avatar} alt={`Avatar of ${name}`} />
            </div>
            <div className="hero__text">
                <p className="hero__hello">Hello, I am</p>
                <h1 className="hero__name">{name}</h1>
                <p className="hero__role">{role}</p>
                <p className="hero__tagline">{tagline}</p>
                <a className="button" href="#contacts">Get in touch</a>
            </div>
        </section>
    );
}
