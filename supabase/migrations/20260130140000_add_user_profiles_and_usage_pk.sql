alter table public.user_usage drop constraint if exists user_usage_pkey;
alter table public.user_usage add constraint user_usage_pkey primary key (user_id, month_key);

create table
  public.user_profiles (
    user_id uuid not null references auth.users (id),
    is_pro boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint user_profiles_pkey primary key (user_id)
  );
