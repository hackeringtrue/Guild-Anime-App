# Guild Anime App (Expo + TypeScript)

A starter mobile app for managing an anime guild with ranks, premium membership, and a catalog of movies/anime. Built with Expo Router and Zustand. Includes screens for Home, Movies, Anime, Search, and a content details page with a preview player.

## Features
- Guild ranks and premium status
- Home with featured carousel
- Lists for Movies and Anime
- Search with instant filtering
- Content details with video preview (expo-av)

## Quickstart (Windows PowerShell)

```powershell
# From the project root
cd .\guild-anime-app
npm install
npx expo start
```

- Press 'a' to open on Android, 'w' for web, or scan the QR code with Expo Go.

## Notes
- This repo uses placeholder images/video URLs. Replace them with your assets.
- If you see TypeScript errors before installing, run `npm install` first.
- For Android builds, ensure Android SDK is installed; for iOS you need a Mac.

## Supabase Auth Setup

1) Configure keys
- Put your Supabase URL and anon key in `app.json` under `extra.supabase`, or export environment variables:
	- `EXPO_PUBLIC_SUPABASE_URL`
	- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

2) Redirects for email confirmation
- In Supabase → Authentication → URL Configuration, set:
	- Site URL: your dev origin (example: `http://localhost:8081` or your Expo tunnel URL)
	- Additional Redirect URLs:
		- `http://localhost:8081/auth-callback`
		- `guildanime://auth-callback`

3) Cross-network confirmations
- If testing on a phone over Wi‑Fi, localhost won’t be reachable. Set `app.json` → `extra.auth.webRedirectBase` to your machine IP or tunnel:
	- Example: `http://192.168.1.189:8081`
	- Or start with a tunnel: `npx expo start --tunnel --web`, then use the shown URL.
- The app will generate email links using that base so they open on other devices.

4) Resend confirmation
- On the Login screen, use “Resend confirmation email” to generate a fresh link with the correct redirect.

Troubleshooting
- If an email opens `localhost:3000`, it was generated before your settings changed or the URL isn’t allowed in Supabase. Update the URLs above and resend a fresh confirmation email.
