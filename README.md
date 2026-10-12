# AvastLuxe Float Shield v2 — NEW app (original `avastluxe-shield.surge.sh` untouched)

## 🔴 LIVE LINK (open this)
**https://alfinirudayaraj-ux.github.io/avastluxe-float-shield/**

Repo: https://github.com/alfinirudayaraj-ux/avastluxe-float-shield

Real-time guard with 1-second watchers + premium floating tab + OS-level PiP float + dead-link detection.

## What it does (real life, real time)
- **1s watchers:** clipboard links, typing (no button needed), tapped links, visible page text — every second.
- **Optional screen OCR 1s:** ALLOW once → on-device Tesseract reads URLs/messages anywhere on the shared screen, auto-scans them. Nothing leaves the phone.
- **Very fast:** instant on-device verdict in single-digit ms appears in the floating tab immediately, then deep live check (DNS-over-HTTPS + RDAP age + reachability) upgrades it in ~2-4s.
- **Floating tab:** draggable glassmorphic shield (always on top in-page) + **📺 PiP button** — a real OS-level mini-window that floats above WhatsApp/Chrome/other apps. Tap PiP, switch apps, verdict stays visible.
- **Dead links:** DNS NX + registry miss + server down → `🔌 DEAD — DOES NOT EXIST` in the floating tab.
- **Background:** service worker + system notifications + wake lock → verdicts arrive even when tab is minimized.

## Honest limits (browser sandbox)
A pure website **cannot** draw over all Android apps or scan the whole OS without a native shell — browsers block that for security. This app ships the closest web-legal stack:
1. In-app float (always on top here) 2. PiP float (OS-level, above other apps) 3. Background notifications. For a Play-Store overlay over every app, see step 4.

## Run locally (if you want localhost)
Open **PowerShell** and run all three lines, then open the URL:
```powershell
cd D:\avastluxe-float-shield
python -m http.server 8000
# then in your browser open:  http://localhost:8000/
```
Troubleshooting: the folder must be opened (not `file://`), the server window must stay open, and if port 8000 is busy use `python -m http.server 8099` → `http://localhost:8099/`. Notifications/PiP/clipboard need `http://localhost` or `https://` — `file://` blocks them, which is why the live https link above is easiest.

## Push updates (already set up)
```bash
cd D:\avastluxe-float-shield
git add -A && git commit -m "update" && git push
# GitHub Pages auto-redeploys in ~30-60s at the link above.
```

## Host as a NEW surge URL (optional — needs your Surge login)
```bash
npm i -g surge
cd D:\avastluxe-float-shield
surge . avastluxe-float-shield.surge.sh
```

## Step 4 — true system-wide overlay (optional native wrapper)
```bash
npm i -g @capacitor/cli
npm init -y && npm i @capacitor/core @capacitor/android
npx cap init FloatShield com.avastluxe.floatshield --web-dir=.
npx cap add android
# In Android Studio: add ForegroundService + SYSTEM_ALERT_WINDOW permission,
# draw the verdict WebView as TYPE_APPLICATION_OVERLAY. Web code already exposes
# window.__shieldVerdict = {verdict, score, host} for the native shell to mirror.
```

## Tests
- `node test-engine.mjs` — instant engine: scam/message/safe/typing speed + dead-link fusion logic.
- In-app: one-tap scam set + **Dead link test** button + ⚡ SPEED TEST + 👁️ SCREEN SCAN.
