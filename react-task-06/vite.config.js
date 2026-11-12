import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
    plugins: [react()],
    // Absolute base for the build: with nested URLs like /crew/3 a relative
    // base ('./') would resolve assets to /crew/assets/... and break.
    // The router uses the same value as its basename (import.meta.env.BASE_URL).
    // Deep links on GitHub Pages are handled by gh-pages-404.html.
    base: command === 'build' ? '/react-fall-2026/react-task-06/' : '/',
}));
