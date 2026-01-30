-- Create video analyses table
create table
  public.video_analyses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id),
    status text not null default 'completed',
    source_type text not null,
    source_url text null,
    storage_path text null,
    transcript text not null,
    hook_analysis jsonb not null,
    structure_breakdown jsonb not null,
    rewrite_suggestions jsonb not null,
    created_at timestamptz not null default now()
  );

create index video_analyses_user_id_created_at_idx on public.video_analyses (user_id, created_at desc);

-- Create script templates table
create table
  public.script_templates (
    id uuid primary key,
    user_id uuid not null references auth.users (id),
    title text not null,
    template jsonb not null,
    created_at timestamptz not null default now()
  );
