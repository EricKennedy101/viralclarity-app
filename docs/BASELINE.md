# Baseline

To run locally you must set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

You can find these values in Supabase: Project → Settings → API.

Storage bucket (manual step):

- Supabase Dashboard → Storage → Create bucket `uploads` (private is fine).

Uploads are limited to ~25MB, which typically supports clips up to ~60 seconds depending on bitrate.
