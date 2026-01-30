create table
  public.user_usage (
    user_id uuid not null references auth.users (id),
    month_key text not null,
    analyses_count int not null default 0,
    updated_at timestamptz not null default now(),
    constraint user_usage_pkey primary key (user_id)
  );

alter table public.video_analyses add column locked boolean not null default false;
