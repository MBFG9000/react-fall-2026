const APP_NAME = 'Meridian Crew';

/**
 * Sets the browser tab title, e.g. "Dashboard · Meridian Crew".
 * Pages call it inside useEffect, because document.title is outside React.
 */
export function setPageTitle(title) {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
}
