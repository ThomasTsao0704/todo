-- ================================================
-- SaaS Todo App – Complete Database Schema
-- Run in Supabase Dashboard → SQL Editor
-- ================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── profiles ────────────────────────────────────
-- Mirrors auth.users; stores plan & Stripe IDs
create table public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              text,
  is_pro             boolean default false,
  stripe_customer_id text unique,
  stripe_sub_id      text unique,
  sub_status         text default 'free',   -- free | active | past_due | canceled
  sub_period_end     timestamptz,
  created_at         timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── tasks ───────────────────────────────────────
create table public.tasks (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null check(length(text) between 1 and 500),
  category   text not null default 'other',
  priority   text not null default 'medium' check(priority in ('low','medium','high')),
  done       boolean default false,
  created_at timestamptz default now()
);

create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_done_idx     on public.tasks(user_id, done);

alter table public.tasks enable row level security;

-- Users can only see/touch their own tasks
create policy "Users CRUD own tasks"
  on public.tasks for all
  using (auth.uid() = user_id);

-- ─── Free-tier limit enforcement (DB layer) ───────
-- Blocks insert when free user has ≥ 50 tasks
create or replace function public.check_task_limit()
returns trigger language plpgsql security definer as $$
declare
  task_count int;
  user_is_pro boolean;
begin
  select count(*) into task_count
  from public.tasks where user_id = new.user_id;

  select is_pro into user_is_pro
  from public.profiles where id = new.user_id;

  if not user_is_pro and task_count >= 50 then
    raise exception 'FREE_LIMIT_EXCEEDED: Upgrade to Pro to add more tasks.';
  end if;
  return new;
end;
$$;

create trigger enforce_task_limit
  before insert on public.tasks
  for each row execute procedure public.check_task_limit();
