# Supabase Setup

1) Run SQL
- Open Supabase SQL editor for your project.
- Paste and run `supabase/schema.sql`.

2) Configure Storage
- Confirm a public bucket named `media` exists (script creates it if missing).
- Optional: Create folders `poster/`, `banner/`, `previewUrl/` for organization.

3) RLS and Writes
- Content table is public-read. Writes restricted to `service_role` by default.
- For in-app admin writes, either:
  - Call your own backend using service key, or
  - Change the policy to allow your user id(s) (see commented example in SQL).

4) App Config
- Ensure `app.json` (or `app.config.js`) has your Supabase URL and anon key under `expo.extra.supabase`.
- In the app, the admin screen uploads to `media` bucket and writes to `content`.

5) Packages
- Installed: `expo-document-picker`, `mime-types`.

6) Open Admin Screen
- Navigate to `/admin` in the app router.
- If you want a tab or protected route, let me know and I’ll wire it.
