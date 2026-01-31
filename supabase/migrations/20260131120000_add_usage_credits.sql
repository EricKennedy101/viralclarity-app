create table if not exists public.usage_credits (
  user_id uuid references auth.users (id) on delete cascade not null,
  date text not null,
  used int not null default 0,
  primary key (user_id, date)
);
