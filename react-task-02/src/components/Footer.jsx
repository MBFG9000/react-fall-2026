export default function Footer({ name }) {
    return (
        <footer className="footer">
            <p>© {new Date().getFullYear()} {name} · Built with React and Vite</p>
        </footer>
    );
}
