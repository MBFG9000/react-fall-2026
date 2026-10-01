export default function Header({ plants }) {
    console.log('[render] Header');

    const thirsty = plants.filter((p) => p.status === 'thirsty').length;
    const recovering = plants.filter((p) => p.status === 'recovering').length;

    let summary;
    if (plants.length === 0) {
        summary = 'No plants yet. Add one to start tracking its care.';
    } else if (thirsty === 0 && recovering === 0) {
        summary = `${plants.length} plants in your care, and every one is thriving.`;
    } else {
        const parts = [];
        if (thirsty > 0) parts.push(`${thirsty} need water`);
        if (recovering > 0) parts.push(`${recovering} recovering`);
        summary = `${plants.length} plants in your care. ${parts.join(', ')}.`;
    }

    return (
        <header className="header">
            <svg className="header__leaf" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M27 5C14 5 5 11 5 21c0 2 .5 4 1.5 6C8 18 14 13 21 11c-6 4-11 9-13 16 2 1 4 1.5 6 1.5 9 0 13-9 13-23.5Z" />
            </svg>
            <div>
                <h1 className="header__title">Glasshouse</h1>
                <p className="header__summary">{summary}</p>
            </div>
        </header>
    );
}
