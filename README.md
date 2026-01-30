# Viral Clarity

Viral Clarity helps creators analyze viral TikTok videos to understand hooks, retention, and rewrite winning formats. Upload a clip or URL, get a transcript, and turn insights into reusable templates.

## Features

- Upload MP4s and generate transcripts with Whisper.
- GPT‑4o‑mini analysis for hooks, retention beats, and rewrites.
- Guest preview mode (transcript + hook only), with full analysis unlocked after signup.
- Save and reuse templates from winning analyses.
- Pricing/paywall with Free vs Pro limits and locked results.
- Supabase Storage for upload persistence.

## Tech Stack

- **Framework:** Next.js (App Router) (React)
- **Database/Auth:** Supabase
- **AI:** OpenAI (Whisper + GPT‑4o‑mini)
- **Billing:** Paddle
- **UI:** shadcn/ui + Tailwind CSS

## Local Setup

1. Install dependencies:
   ```sh
   pnpm install
   ```
2. Create local env:
   ```sh
   cp .env.local.example .env.local
   ```
3. Fill required env vars in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
   - `NEXT_PUBLIC_PADDLE_ENV`
   - `PADDLE_API_KEY`
   - `PADDLE_NOTIFICATION_WEBHOOK_SECRET`
4. Run the app:
   ```sh
   pnpm dev
   ```

## Supabase Setup

Use a hosted Supabase project.

1. Create a project in Supabase.
2. Apply migrations from `supabase/migrations` (SQL editor or Supabase CLI).
3. Create a private storage bucket named `viralclarity-uploads`.

## Scripts

```sh
pnpm lint
pnpm typecheck
pnpm build
```

