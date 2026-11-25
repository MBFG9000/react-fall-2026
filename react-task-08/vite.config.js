import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Builds dist/sw.js from the template src/pwa/sw.js. The template needs to know
// the exact file names Vite produced (they contain content hashes), so it can
// pre-cache the whole app shell. The version is a hash of those files, so every
// deploy with changed code gets a new sw.js, and the browser installs it as an update.
function serviceWorker() {
    let base = '/';
    return {
        name: 'meridian-service-worker',
        apply: 'build',
        enforce: 'post', // run after Vite has added index.html to the bundle
        configResolved(config) {
            base = config.base;
        },
        generateBundle(_options, bundle) {
            const publicFiles = readdirSync('public', { recursive: true })
                .filter((file) => statSync(join('public', file)).isFile())
                .map((file) => file.replaceAll('\\', '/'));
            const builtFiles = Object.keys(bundle).filter((file) => file !== 'index.html' && !file.endsWith('.map'));
            // `base` itself is the index page (the app shell that renders every route).
            const urls = [base, ...[...publicFiles, ...builtFiles].map((file) => base + file)];

            // The version changes when the file list, index.html or the SW code itself changes.
            const template = readFileSync('src/pwa/sw.js', 'utf8');
            const hash = createHash('sha256');
            hash.update(template);
            hash.update(urls.join('\n'));
            const indexHtml = bundle['index.html'];
            if (indexHtml) hash.update(indexHtml.source);

            const source = template
                .replace('__VERSION__', hash.digest('hex').slice(0, 12))
                .replace('__BASE__', base)
                .replace('__PRECACHE_URLS__', JSON.stringify(urls, null, 4));

            this.emitFile({ type: 'asset', fileName: 'sw.js', source });
        },
    };
}

// `vite preview` runs with command 'serve' too, but it serves the build, so it needs the build base.
export default defineConfig(({ command, isPreview }) => ({
    plugins: [react(), serviceWorker()],
    // Absolute base for the build: with nested URLs like /crew/3 a relative
    // base ('./') would resolve assets to /crew/assets/... and break.
    // The router uses the same value as its basename (import.meta.env.BASE_URL).
    // Deep links on GitHub Pages are handled by gh-pages-404.html.
    base: command === 'build' || isPreview ?'/react-fall-2026/react-task-08/' : '/',
}));
