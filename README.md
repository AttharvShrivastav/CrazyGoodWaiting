# Crazy Good waitlist

A minimal Next.js waitlist page, ready for Vercel.

## Local setup

1. Add the five supplied ribbon SVGs to `public/ribbons/`.
2. Add the Monument Extended webfonts to `public/fonts/` as:
   - `MonumentExtended-Regular.woff2`
   - `MonumentExtended-Ultrabold.woff2` (optional; regular is used as fallback)
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL`.
4. For a new database, run `db/schema.sql` once. If the previous email-based
   waitlist schema is already deployed, run
   `db/migrations/001_email_to_name_and_contact.sql` instead. The migration
   keeps existing email signups and makes email optional for new submissions.
5. Run `npm install`, then `npm run dev`.

Vercel only needs the same `DATABASE_URL` environment variable. Database credentials stay server-side.

## Viewing waitlist submissions

For this temporary site, submissions can be viewed directly in the managed
Postgres or Neon database dashboard. No public admin route or read API is
exposed.

```sql
SELECT
  id,
  name,
  contact_number,
  created_at
FROM waitlist
ORDER BY created_at DESC;
```
