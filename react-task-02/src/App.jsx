import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Skills from './components/Skills.jsx';
import Contacts from './components/Contacts.jsx';
import Footer from './components/Footer.jsx';
import { profile } from './data/profile.js';

export default function App() {
    return (
        <>
            <Header name={profile.name} />
            <main className="container">
                <Hero
                    name={profile.name}
                    role={profile.role}
                    tagline={profile.tagline}
                    avatar={profile.avatar}
                />
                <About paragraphs={profile.about} facts={profile.facts} />
                <Skills skills={profile.skills} />
                <Contacts contacts={profile.contacts} />
            </main>
            <Footer name={profile.name} />
        </>
    );
}
