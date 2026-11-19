import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import CachedDataNotice from '../components/CachedDataNotice.jsx';
import { DetailsSkeleton } from '../components/Skeletons.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { getArticle } from '../services/newsApi.js';
import { formatDateTime } from '../utils/format.js';
import { setPageTitle } from '../utils/pageTitle.js';

export default function NewsDetailsPage() {
    const { articleId } = useParams();

    // status: 'loading' | 'success' | 'error'
    const [request, setRequest] = useState({ id: null, status: 'loading', result: null, error: null });
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let ignore = false;
        getArticle(articleId)
            .then((result) => {
                if (ignore) return;
                setRequest({ id: articleId, status: 'success', result, error: null });
                setPageTitle(result.data.title);
            })
            .catch((error) => {
                if (!ignore) setRequest({ id: articleId, status: 'error', result: null, error });
            });
        return () => {
            ignore = true;
        };
    }, [articleId, reloadKey]);

    const isCurrent = request.id === articleId;
    let content;

    if (!isCurrent) {
        content = <DetailsSkeleton />;
    } else if (request.status === 'error' && request.error.offline) {
        return <Navigate to={`/offline?from=${encodeURIComponent(`/news/${articleId}`)}`} replace />;
    } else if (request.status === 'error' && request.error.notFound) {
        content = (
            <StateMessage tone="warning" title="Article not found" text="It may have been removed from the feed.">
                <Link to="/news" className="btn btn--primary">
                    All news
                </Link>
            </StateMessage>
        );
    } else if (request.status === 'error') {
        content = (
            <StateMessage tone="error" title="Could not load the article" text={request.error.message}>
                <button type="button" className="btn btn--primary" onClick={() => setReloadKey((k) => k + 1)}>
                    Try again
                </button>
            </StateMessage>
        );
    } else {
        const { data: article, fromCache, cachedAt } = request.result;
        content = (
            <article className="panel news-article">
                {fromCache && <CachedDataNotice cachedAt={cachedAt} />}
                {article.image_url && <img className="news-article__image" src={article.image_url} alt="" />}
                <p className="eyebrow">
                    {article.news_site} · {formatDateTime(article.published_at)}
                </p>
                <h1 className="news-article__title">{article.title}</h1>
                {article.authors?.length > 0 && (
                    <p className="muted">By {article.authors.map((author) => author.name).join(', ')}</p>
                )}
                <p className="news-article__summary">{article.summary}</p>
                <a className="btn btn--primary" href={article.url} target="_blank" rel="noreferrer">
                    Read on {article.news_site} ↗
                </a>
            </article>
        );
    }

    return (
        <section>
            <nav className="back-links" aria-label="Back">
                <Link to="/news" className="btn btn--ghost btn--small">
                    ← All news
                </Link>
            </nav>
            {content}
        </section>
    );
}
