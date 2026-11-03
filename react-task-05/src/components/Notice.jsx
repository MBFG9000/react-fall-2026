export default function Notice({ notice, onDismiss }) {
    if (!notice) return null;
    return (
        <div className={`notice notice--${notice.tone}`} role={notice.tone === 'error' ? 'alert' : 'status'}>
            <span>{notice.text}</span>
            <button type="button" className="icon-btn" onClick={onDismiss} aria-label="Dismiss">
                ×
            </button>
        </div>
    );
}
