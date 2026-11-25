import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import CachedDataNotice from '../components/CachedDataNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import { CardGridSkeleton } from '../components/Skeletons.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { MAX_NEWS_PAGES } from '../features/news/newsSelectors.js';
import { useNewsPage } from '../hooks/useNews.js';
import { formatDate } from '../utils/format.js';
import { setPageTitle } from '../utils/pageTitle.js';

export default function NewsListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.min(MAX_NEWS_PAGES, Math.max(1, Number(searchParams.get('page')) || 1));

    // The news slice keeps every page that was loaded, so coming back to a page
    // shows it without a new request. Offline without a saved copy, the hook
    // opens /offline.
    const { result, status, error, retry } = useNewsPage(page);

    useEffect(() => {
        setPageTitle('Space news');
    }, []);

    let content;
    if (status === 'error' && !error.offline) {
        content = (
            <StateMessage tone="error" title="Could not load the news" text={error.message}>
                <button type="button" className="btn btn--primary" onClick={retry}>
                    Try again
                </button>
            </StateMessage>
        );
    } else if (!result) {
        // Loading, or offline and about to open /offline.
        content = <CardGridSkeleton count={6} />;
    } else if (result.articles.length === 0) {
        content = <StateMessage title="No articles" text="The news feed is empty right now." />;
    } else {
        content = (
            <>
                {result.fromCache && <CachedDataNotice cachedAt={result.cachedAt} />}
                <ul className="news-grid">
                    {result.articles.map((article) => (
                        <li key={article.id}>
                            <Link to={`/news/${article.id}`} className="news-card">
                                {article.image_url && (
                                    <img className="news-card__image" src={article.image_url} alt="" loading="lazy" />
                                )}
                                <span className="news-card__body">
                                    <span className="news-card__title">{article.title}</span>
                                    <span className="news-card__meta">
                                        {article.news_site} · {formatDate(article.published_at)}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <Pagination
                    page={page}
                    totalPages={result.totalPages}
                    total={`${result.count.toLocaleString('en-GB')}`}
                    onPageChange={(p) => setSearchParams({ page: String(p) })}
                />
            </>
        );
    }

    return (
        <section>
            <PageHeader
                eyebrow="Public API"
                title="Space news"
                subtitle="Latest spaceflight headlines from the Spaceflight News API. Pages you open are saved for offline reading."
            />
            {content}
        </section>
    );
}
