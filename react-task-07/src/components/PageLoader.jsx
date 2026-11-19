// Suspense fallback while a lazy page's code is being downloaded.
export default function PageLoader() {
    return (
        <div className="page-loader" role="status">
            <span className="page-loader__spinner" aria-hidden="true" />
            Loading page…
        </div>
    );
}
