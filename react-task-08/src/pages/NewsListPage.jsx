import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import CachedDataNotice from '../components/CachedDataNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import { CardGridSkeleton } from '../components/Skeletons.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { getArticles, NEWS_PAGE_SIZE } from '../services/newsApi.js';
import { formatDate } from '../utils/format.js';
import { setPageTitle } from '../utils/pageTitle.js';

// The API has ~37 000 articles; showing the first 20 pages is plenty.
const MAX_PAGES = 20;

export default function NewsListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.min(MAX_PAGES, Math.max(1, Number(searchParams.get('page')) || 1));

    // status: 'loading' | 'success' | 'error'
    const [request, setRequest] = useState({ page: null, status: 'loading', result: null, error: null });
    const [reloadKey, setReloadKey] = useState(0); // bumped by "Try again"

    useEffect(() => {
        setPageTitle('Space news');
    }, []);

    useEffect(() => {
        let ignore = false;
        getArticles(page)
            .then((result) => {
                if (!ignore) setRequest({ page, status: 'success', result, error: null });
            })
            .catch((error) => {
                if (!ignore) setRequest({ page, status: 'error', result: null, error });
            });
        return () => {
            ignore = true;
        };
    }, [page, reloadKey]);

    // The answer we have may belong to the previous page while the new one loads.
    const isCurrent = request.page === page;
    const result = isCurrent ? request.result : null;

    let content;
    if (isCurrent && request.status === 'error' && request.error.offline) {
        // Offline and this page was never loaded: show the offline page.
        return <Navigate to={`/offline?from=${encodeURIComponent(`/news?page=${page}`)}`} replace />;
    } else if (isCurrent && request.status === 'error') {
        content = (
            <StateMessage tone="error" title="Could not load the news" text={request.error.message}>
                <button type="button" className="btn btn--primary" onClick={() => setReloadKey((k) => k + 1)}>
                    Try again
                </button>
            </StateMessage>
        );
    } else if (!result) {
        content = <CardGridSkeleton count={6} />;
    } else if (result.data.results.length === 0) {
        content = <StateMessage title="No articles" text="The news feed is empty right now." />;
    } else {
        const totalPages = Math.min(MAX_PAGES, Math.ceil(result.data.count / NEWS_PAGE_SIZE));
        content = (
            <>
                {result.fromCache && <CachedDataNotice cachedAt={result.cachedAt} />}
                <ul className="news-grid">
                    {result.data.results.map((article) => (
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
                    totalPages={totalPages}
                    total={`${result.data.count.toLocaleString('en-GB')}`}
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
