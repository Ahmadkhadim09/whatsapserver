# Self-Hosted WhatsApp Contact Form Server (whatsapp-web.js + Docker)

Sends you a WhatsApp message whenever someone submits your portfolio's contact form — fully self-owned, no CallMeBot, no Meta developer account.

## Why Docker

Earlier attempts to deploy this directly on Render/Railway without Docker repeatedly failed because Puppeteer's Chromium download step is flaky in cloud build environments (corrupted downloads, silent skips, cache issues). This version uses Docker with the **official Puppeteer image**, which already has Chrome pre-installed — eliminating the download step (and its failures) entirely.

## Files
- `server.js` — the Express + whatsapp-web.js server
- `package.json` — dependencies
- `Dockerfile` — builds a container with Chrome pre-installed
- `index.html` — a ready-to-open test page with the contact form wired up
- `frontend-example.html` / `portfolio-contact-script.html` — snippets to copy into your real site
- `.gitignore` — excludes `node_modules/`, `session/` (your WhatsApp login — never commit this), and `.env`

## 1. Test locally (optional — Docker required for this step)

If you have Docker Desktop installed:
```bash
docker build -t whatsapp-server .
docker run -p 3000:3000 -e NOTIFY_NUMBER=923139401824 whatsapp-server
```
Watch the terminal for the QR code, scan it with WhatsApp (Linked Devices → Link a Device), wait for `WhatsApp client is ready.`

If you don't have Docker locally, that's fine — skip straight to deploying, since Railway/Render build the Docker image for you in the cloud.

## 2. Deploy on Railway (recommended)

1. Push this whole folder to a GitHub repo (make sure `.gitignore` is committed **before** your first `git add .`, so `node_modules/` and `session/` never get tracked).
2. Go to railway.app → **New Project → Deploy from GitHub repo** → select your repo.
3. Railway auto-detects the `Dockerfile` and builds from it — no build/start command configuration needed.
4. Add an environment variable:
   ```
   NOTIFY_NUMBER=923139401824
   ```
5. Deploy, then open the **Deploy Logs** — the QR code prints there. Scan it with your phone.
6. Wait for `WhatsApp client is ready.` in the logs.
7. Copy your public URL (something like `https://your-app.up.railway.app`).

## 3. Connect your live portfolio

In your portfolio's contact form script, set:
```js
const ENDPOINT = 'https://your-app.up.railway.app/send-whatsapp';
```
Redeploy your portfolio with that change.

## Notes / limitations
- This is unofficial automation of WhatsApp Web, not Meta's official API — fine for a low-traffic contact form, but don't use it for bulk/marketing messages.
- Check whether your host gives persistent disk storage for the `session/` folder — without it, a redeploy wipes your login and you'll need to rescan the QR code.
- Free tiers on most hosts spin down after inactivity, causing the first request after idle time to be slow.
