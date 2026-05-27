# DOGE Surprise Mission — GitHub Files

This public version hides the milestone list, demo buttons, mission log, and visible price-animation details from visitors.

## Public site shows only

- Current DOGE price
- Target price: `$1.00`
- Surprise animations based on live price thresholds
- `Doge Visitor Count`
- `Doge R1 Space Launch` countdown

## Files to upload to GitHub

Upload these files to the root of your repository:

```text
index.html
styles.css
app.js
README.md
```

## Visitor count

The visitor count uses CountAPI:

```text
https://countapi.mileshilliard.com/api/v1/hit/<unique-site-key>
```

The key is generated from your website hostname. For example, your deployed domain gets its own counter.

If CountAPI is unavailable, the site falls back to a local browser-only count.

## Launch countdown

The countdown target is set in `app.js`:

```js
const LAUNCH_TARGET_UTC = "2026-09-13T00:00:00Z";
```

Change that value if your preferred Doge R1 / DOGE-1 launch target date changes.

## Run locally

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Deploy with GitHub Pages

1. Create a GitHub repo.
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md`.
3. Go to **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Choose your branch, usually `main`.
6. Choose `/root`.
7. Save.
