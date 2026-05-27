# DOGE-1 Launch Tracker

A GitHub Pages-ready static website that tracks the live Dogecoin price and plays Doge rocket-part milestone animations based on the current price.

## Features

- Live DOGE price card.
- DOGE-1 launch tracker card.
- Progress meter from the current DOGE price to `$1.00`.
- Animated Doge scenes for price milestones from `$0.20` through `$0.90`.
- Bottom footer visitor counter labeled `Wag Count (Visitor Count)`.
- Preview buttons so you can test every animation without waiting for the live price.
- Responsive layout for desktop and mobile.
- Reference images included in `assets/reference/` for visual/style continuity.

## Price animation map

| DOGE price | Animation |
|---:|---|
| $0.20 | Doge finds the red rocket ship nose cone. |
| $0.30 | Doge joyfully finds a propellant tank in a junk yard. |
| $0.40 | Doge trades his prized dinosaur bone to the frog museum owner for rocket engines. |
| $0.50 | Doge finds the fuel system and fuel feed lines at a garage sale, buys it from a Chihuahua, and pays with a fire hydrant pee rights voucher. |
| $0.60 | Doge buys the rocket ship body at an auction for a bag full of treats. |
| $0.70 | Doge is startled by a guidance/navigation system falling in front of him while walking in the park. |
| $0.80 | Doge gambles his house and wins a stage separation system. |
| $0.90 | Doge receives an honorary DOGE-1 space suit. |

## How to deploy on GitHub Pages

1. Create a new GitHub repository.
2. Upload all files from this folder to the repository root:
   - `index.html`
   - `style.css`
   - `script.js`
   - `assets/reference/*`
3. In GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose the `main` branch and `/root`, then save.
6. Open the GitHub Pages URL after deployment finishes.

## Notes

- DOGE price data is fetched from the public CoinGecko simple price endpoint.
- The visitor count uses CountAPI when available. If CountAPI is unreachable, the site falls back to a local browser-only count so the page still works.
- No build step is required. This is plain HTML, CSS, and JavaScript.
