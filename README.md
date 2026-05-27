diff --git a/README.md b/README.md
index 824a94ceb6662e51bfa6e8e7ef0a7a2ffc0059bb..522a2597f4b80ceb85a400bb63c0c44633949a97 100644
--- a/README.md
+++ b/README.md
@@ -1,39 +1,89 @@
 # DOGE Moon Mission — Multi-Step Landing Edition
 
-A polished static website that tracks the live Dogecoin price in USD and plays milestone-based story animations.
+A polished static website that tracks the live Dogecoin price in USD with a clean, price-only interface and coin motion effects.
 
-## New moon finale upgrade
+## Tagline
 
-At **$1.00**, the moon scene now plays a true multi-step finale:
-
-1. **Approach** — the rocket lines up for descent  
-2. **Hover** — the rocket pauses above the landing zone  
-3. **Touchdown** — lunar dust blooms outward as the rocket lands  
-4. **Flag plant** — Doge steps out and plants the **DOGE TO THE MOON** flag
-
-## Included story milestones
-
-- Below **$0.15**: Doge searches junkyard piles and trades bones/treats for clues
-- **$0.20**: Nose cone / fairing found
-- **$0.30**: Propellant tanks found
-- **$0.40**: Rocket engines found
-- **$0.50**: Fuel system / feed lines found
-- **$0.60**: Structural frame / body found
-- **$0.70**: Guidance, navigation, and control system found
-- **$0.80**: Stage separation system found
-- **$0.90**: Astronaut suit found at SPACE X, given by a cartoon Elon Musk
-- **$1.00**: Doge lands on the moon with a multi-step cinematic sequence
+**Catch the wow, live now.**
 
 ## Run locally
 
 Open `index.html` directly, or start a local server:
 
 ```bash
 python3 -m http.server 8080
 ```
 
 Then visit `http://localhost:8080`.
 
-## Deploy
+## Deploy to `https://dodgetracker.org` (GitHub Pages)
+
+The repo already includes a `CNAME` file set to `dodgetracker.org`.
+
+### Step-by-step
+
+1. **Push this repo to GitHub**
+   - Create a GitHub repository.
+   - Push this project to the `main` branch.
+
+2. **Turn on GitHub Pages**
+   - Go to **Repo → Settings → Pages**.
+   - Under **Build and deployment**, set:
+     - **Source**: *Deploy from a branch*
+     - **Branch**: `main` and `/ (root)`
+   - Click **Save**.
+
+3. **Add DNS records at your domain provider**
+   - For the apex/root domain (`dodgetracker.org`), create **A** records to:
+     - `185.199.108.153`
+     - `185.199.109.153`
+     - `185.199.110.153`
+     - `185.199.111.153`
+   - For `www` (recommended), create a **CNAME** record:
+     - Host/Name: `www`
+     - Target/Value: `<your-github-username>.github.io`
+
+4. **Set custom domain in GitHub**
+   - In **Repo → Settings → Pages**, set **Custom domain** to:
+     - `dodgetracker.org`
+   - Save. GitHub should detect the `CNAME` file automatically as well.
+
+5. **Wait for DNS + certificate issuance**
+   - DNS propagation usually takes a few minutes to a few hours (sometimes up to 24–48 hours).
+   - Once ready, GitHub Pages will issue a TLS certificate.
+
+6. **Enable HTTPS**
+   - In **Repo → Settings → Pages**, check **Enforce HTTPS**.
+
+7. **Verify both URLs**
+   - `https://dodgetracker.org`
+   - `https://www.dodgetracker.org` (if configured)
+
+### Quick troubleshooting
+
+- If the site is not loading yet, wait and re-check DNS propagation.
+- If HTTPS is unavailable, wait until GitHub finishes certificate provisioning.
+- If `www` does not work, verify the `www` CNAME target exactly matches `<your-github-username>.github.io`.
+- If root domain does not work, confirm all 4 A records are present and there are no conflicting records.
+
+
+### Name.com specific DNS steps
+
+If your domain is managed at **Name.com**, use these exact steps for DNS:
+
+1. Log in to Name.com and open **My Domains** → `dodgetracker.org` → **Manage** → **DNS Records**.
+2. Remove conflicting records for host `@` (apex) and `www` (especially parked/forwarding A or URL redirect records).
+3. Add or confirm these **A** records (Host = `@`):
+   - `185.199.108.153`
+   - `185.199.109.153`
+   - `185.199.110.153`
+   - `185.199.111.153`
+4. Add a **CNAME** record for `www`:
+   - **Host**: `www`
+   - **Answer/Value**: `<your-github-username>.github.io`
+5. Save changes and wait for propagation (often under 1 hour, can take up to 24–48 hours).
+6. Go back to **GitHub → Repo → Settings → Pages** and confirm:
+   - Custom domain = `dodgetracker.org`
+   - **Enforce HTTPS** is enabled (once certificate is issued).
 
-Upload `index.html`, `styles.css`, and `app.js` to any static hosting provider.
+> Note: If Name.com asks for TTL, leave default (or use 300 seconds while configuring).
