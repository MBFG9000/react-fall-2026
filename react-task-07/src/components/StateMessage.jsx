// One component for the loading / error / empty / not-found messages, so they
// look the same on every page.
export default function StateMessage({ tone = 'neutral', title, text, children, role }) {
    const ariaRole = role ?? (tone === 'error' ? 'alert' : undefined);
    return (
        <div className={`state state--${tone}`} role={ariaRole}>
            {title && <p className="state__title">{title}</p>}
            {text && <p className="state__text">{text}</p>}
            {children && <div className="state__actions">{children}</div>}
        </div>
    );
}
