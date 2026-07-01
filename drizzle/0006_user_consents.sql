do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_consents'
      and column_name = 'user_id'
      and data_type <> 'uuid'
  ) then
    drop table public.user_consents;
  end if;
end $$;--> statement-breakpoint
create table if not exists public.user_consents (
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  consent_version text not null,
  is_granted boolean not null default false,
  granted_at timestamptz,
  revoked_at timestamptz,
  source text not null,
  locale text,
  region text,
  updated_at timestamptz not null default now(),
  primary key (user_id, consent_type),
  constraint user_consents_type_check
    check (consent_type in ('ai_interpretation', 'china_model_provider')),
  constraint user_consents_state_check
    check (
      (is_granted = true and granted_at is not null and revoked_at is null)
      or
      (is_granted = false and revoked_at is not null)
    )
);--> statement-breakpoint
alter table public.user_consents enable row level security;--> statement-breakpoint
revoke all on public.user_consents from anon, authenticated;--> statement-breakpoint
grant select, insert, update on public.user_consents to authenticated;--> statement-breakpoint
drop policy if exists "Users can read their own consent state" on public.user_consents;--> statement-breakpoint
create policy "Users can read their own consent state"
on public.user_consents
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);--> statement-breakpoint
drop policy if exists "Users can insert their own consent state" on public.user_consents;--> statement-breakpoint
create policy "Users can insert their own consent state"
on public.user_consents
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);--> statement-breakpoint
drop policy if exists "Users can update their own consent state" on public.user_consents;--> statement-breakpoint
create policy "Users can update their own consent state"
on public.user_consents
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);--> statement-breakpoint
notify pgrst, 'reload schema';
