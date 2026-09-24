const links = [
    { href: '#about', label: 'About' },
    { href: '#skills', label: 'Skills' },
    { href: '#contacts', label: 'Contacts' },
];

export default function Header({ name }) {
    return (
        <header className="header">
            <div className="container header__inner">
                <a href="#top" className="header__logo">{name}</a>
                <nav className="header__nav">
                    {links.map((link) => (
                        <a key={link.href} href={link.href}>{link.label}</a>
                    ))}
                </nav>
            </div>
        </header>
    );
}
