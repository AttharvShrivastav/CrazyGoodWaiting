# Crazy Good waitlist

A minimal Next.js waitlist page, ready for Vercel.

## Local setup

1. Add the five supplied ribbon SVGs to `public/ribbons/`.
2. Add the Monument Extended webfonts to `public/fonts/` as:
   - `MonumentExtended-Regular.woff2`
   - `MonumentExtended-Ultrabold.woff2` (optional; regular is used as fallback)
3. Copy `.env.example` to `.env.local` and set:
   - `GOOGLE_SHEETS_WEBHOOK_URL` to the deployed Google Apps Script web app URL.
   - `WAITLIST_SECRET` to the same secret configured in the Apps Script.
4. Run `npm install`, then `npm run dev`.

Add both environment variables to the Vercel project before deploying. They are
read only by `POST /api/waitlist` and are never included in browser JavaScript.

## Viewing waitlist submissions

Submissions are appended by the server-side API route to the Google Sheet
connected to the Apps Script. View entries directly in that Sheet. The site has
no public admin route or read API.
