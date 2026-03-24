# Running and Deploying the App

## Run Locally

A local HTTP server is required (service worker needs `localhost`, not `file://`).

### Python 3

```bash
python3 -m http.server 8080
```

Open: `http://localhost:8080`

### Node.js (npx)

```bash
npx serve . -p 8080
```

Open: `http://localhost:8080`

### VS Code

Right-click `index.html` → **Open with Live Server**.

---

## Deploy to GitHub Pages

```bash
git checkout master
git merge 001-basic-story-form
git push origin master
```

The app is served from the `master` branch root via GitHub Pages.
Live at: `https://nyco.github.io/Lean-Storytelling/`

GitHub Pages uses HTTPS, so the service worker registers and offline mode
works exactly as on `localhost`.

---

## Offline Use

After the first page load all assets are cached by the service worker.
Disable your network connection and reload — the app continues to work fully.
