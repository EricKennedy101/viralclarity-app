insert into storage.buckets (id, name, public)
values ('viralclarity-uploads', 'viralclarity-uploads', false)
on conflict (id) do nothing;
