# Task 2 — About Me (React SPA)

A self-promotional single page application built with React and Vite.

**Live:** https://mbfg9000.github.io/react-fall-2026/react-task-02/

## Run locally

```bash
npm install
npm run dev      # dev server
npm run build    # production build into dist/
```

## Structure

- `src/data/profile.js` — all the content (name, about text, skills, contacts). Edit this file to change the page.
- `src/components/` — React components:
  - `Header` — sticky navigation
  - `Hero` — name, image, role and tagline
  - `Section` — shared card wrapper used by the sections below
  - `About` — About Me text and quick facts
  - `Skills` — clickable skill chips (uses `useState`)
  - `Contacts` — safe contact info (GitHub, "Planet Earth", …)
  - `Footer`
- `public/avatar.svg` — the profile image.

## Deployment

Deployed by `.github/workflows/deploy.yml` at the repo root: on every push to `main` it builds this
app and publishes it to GitHub Pages together with the other tasks.
