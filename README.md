# Punarnirmanam — Habit Tracker

A beginner-friendly, responsive habit tracker built with plain HTML, CSS, and JavaScript.

## Files
- `index.html` — page structure and PWA setup
- `style.css` — visual design and responsive layout
- `script.js` — habits, check-ins, streaks, calendar, statistics, and local saving
- `manifest.webmanifest` — installable app metadata
- `sw.js` — basic offline caching for the app shell
- `icon.svg` — app icon

## Run it locally

You can open `index.html` directly to explore the tracker, but browser storage and PWA features are more reliable when served from localhost. If Python is installed, open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`. Stop the server with `Ctrl+C`.

## Install it on your phone/computer

1. Upload the folder to a static host that serves HTTPS (for example, GitHub Pages or Netlify).
2. Open the hosted URL in a supported browser.
3. Use the browser menu's **Install app** or **Add to Home Screen** option if available.

The included service worker caches the app shell for basic offline use after the first successful load.

## Data and privacy

Habits and check-ins are stored in this browser using `localStorage`. There is no login or cloud sync in this version. Clearing the browser's site data may erase saved progress.

## Beginner learning path
1. Change labels and page structure in `index.html`.
2. Change colors, spacing, and mobile layout in `style.css`.
3. Study `script.js`: `renderToday()` updates the dashboard, `renderCalendar()` draws the month, and `save()` stores progress.
4. Try adding a habit, completing it, then refreshing the page to see persistence.
