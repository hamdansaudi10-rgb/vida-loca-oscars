-- VIDA LOCA OSCARS database setup. Paste all of this into Supabase > SQL Editor > Run.

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id bigint generated always as identity primary key,
  submission_id uuid not null references public.submissions(id) on delete restrict,
  category_id text not null,
  nominee_id text not null,
  created_at timestamptz not null default now(),
  unique (submission_id, category_id)
);

create index if not exists votes_category_nominee_idx on public.votes (category_id, nominee_id);

-- Lock the tables: the public (anon) key can't read, edit or delete anything.
-- Only the server (service role key) can use them.
alter table public.submissions enable row level security;
alter table public.votes enable row level security;

-- Saves one whole submission (all selected nominees) as a brand-new entry, atomically.
create or replace function public.submit_votes(p_votes jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare sid uuid;
begin
  insert into public.submissions default values returning id into sid;
  insert into public.votes (submission_id, category_id, nominee_id)
  select sid, v->>'category_id', v->>'nominee_id'
  from jsonb_array_elements(p_votes) as v;
  return sid;
end;
$$;

-- Counts votes per nominee across all submissions.
create or replace function public.get_results()
returns table (category_id text, nominee_id text, vote_count bigint)
language sql
security definer
set search_path = public
as $$
  select category_id, nominee_id, count(*)::bigint
  from public.votes
  group by category_id, nominee_id;
$$;

revoke all on function public.submit_votes(jsonb) from public, anon, authenticated;
revoke all on function public.get_results() from public, anon, authenticated;
grant execute on function public.submit_votes(jsonb) to service_role;
grant execute on function public.get_results() to service_role;
