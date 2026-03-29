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
# Lean Storytelling App — Run, Test, and Deploy

## 1) Run locally (5 minutes)

```bash
npm start
```

Open: `http://localhost:5000`

## 2) Test locally

### Syntax check
```bash
npm run check
```

### End-to-end smoke test
```bash
npm test
```

This script automatically:
- starts the server,
- creates a user,
- extracts generated password,
- logs in,
- verifies authenticated dashboard content,
- stops the server.

## 3) Review publicly for free

A practical free option is **Render (Free Web Service)**.

### Deploy on Render
1. Push this repository to your GitHub account.
2. Go to Render dashboard → **New** → **Web Service**.
3. Connect your GitHub repo.
4. Configure:
   - Runtime: Node
   - Build command: *(leave empty)*
   - Start command: `npm start`
5. Add environment variable:
   - `METRICS_TOKEN` = long random secret
6. Deploy.

Your public URL will look like:
- `https://your-service-name.onrender.com`

## 4) Private metrics endpoint (owner only)

Feature demand counters are intentionally hidden from end users.

Use:

```text
/_internal/feature-demand?token=YOUR_METRICS_TOKEN
```

Example:

```bash
curl "https://your-service-name.onrender.com/_internal/feature-demand?token=YOUR_METRICS_TOKEN"
```

## 5) Why you may not see commit/branch on GitHub yet

If you only run this agent locally, commits are created in your local git clone only.
You must push to GitHub:

```bash
git push origin <your-branch>
```

If no `origin` remote exists, add it first:

```bash
git remote add origin https://github.com/Nyco/Lean-Storytelling.git
git push -u origin <your-branch>
```

If you do not have push rights to that repository, push to your fork and open a PR.
