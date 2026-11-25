import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import CachedDataNotice from '../components/CachedDataNotice.jsx';
import { DetailsSkeleton } from '../components/Skeletons.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { useNewsArticle } from '../hooks/useNews.js';
import { formatDateTime } from '../utils/format.js';
import { setPageTitle } from '../utils/pageTitle.js';

export default function NewsDetailsPage() {
    const { articleId } = useParams();
    const { article, fromCache, cachedAt, status, error, retry } = useNewsArticle(articleId);
    const title = article?.title;

    useEffect(() => {
        if (title) setPageTitle(title);
    }, [title]);

    let content;

    if (status === 'error' && error.notFound) {
        content = (
            <StateMessage tone="warning" title="Article not found" text="It may have been removed from the feed.">
                <Link to="/news" className="btn btn--primary">
                    All news
                </Link>
            </StateMessage>
        );
    } else if (status === 'error' && !error.offline && !article) {
        content = (
            <StateMessage tone="error" title="Could not load the article" text={error.message}>
                <button type="button" className="btn btn--primary" onClick={retry}>
                    Try again
                </button>
            </StateMessage>
        );
    } else if (!article) {
        // Loading, or offline and about to open /offline.
        content = <DetailsSkeleton />;
    } else {
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
