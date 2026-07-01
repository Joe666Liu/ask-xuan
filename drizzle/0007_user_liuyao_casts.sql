create extension if not exists pgcrypto;--> statement-breakpoint
create table if not exists public.user_liuyao_casts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  coin_throws jsonb not null,
  lower_trigram text,
  upper_trigram text,
  hexagram_title text not null,
  result_output text not null,
  run_id text not null,
  completed_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);--> statement-breakpoint
create index if not exists user_liuyao_casts_user_completed_at_idx
on public.user_liuyao_casts (user_id, completed_at desc);--> statement-breakpoint
create unique index if not exists user_liuyao_casts_user_run_id_idx
on public.user_liuyao_casts (user_id, run_id);--> statement-breakpoint
alter table public.user_liuyao_casts enable row level security;--> statement-breakpoint
grant select, insert, update, delete on table public.user_liuyao_casts to authenticated;--> statement-breakpoint
drop policy if exists "Users can read their own liuyao casts" on public.user_liuyao_casts;--> statement-breakpoint
create policy "Users can read their own liuyao casts"
on public.user_liuyao_casts
for select
to authenticated
using ((select auth.uid()) = user_id);--> statement-breakpoint
drop policy if exists "Users can insert their own liuyao casts" on public.user_liuyao_casts;--> statement-breakpoint
create policy "Users can insert their own liuyao casts"
on public.user_liuyao_casts
for insert
to authenticated
with check ((select auth.uid()) = user_id);--> statement-breakpoint
drop policy if exists "Users can update their own liuyao casts" on public.user_liuyao_casts;--> statement-breakpoint
create policy "Users can update their own liuyao casts"
on public.user_liuyao_casts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);--> statement-breakpoint
drop policy if exists "Users can delete their own liuyao casts" on public.user_liuyao_casts;--> statement-breakpoint
create policy "Users can delete their own liuyao casts"
on public.user_liuyao_casts
for delete
to authenticated
using ((select auth.uid()) = user_id);--> statement-breakpoint
notify pgrst, 'reload schema';
