create extension if not exists pgcrypto;--> statement-breakpoint
create table if not exists public.user_birth_profile_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  owner_kind text not null default 'other',
  display_name text not null default '',
  relation_note text not null default '',
  name text not null default '',
  gender smallint not null,
  calendar_kind text not null,
  solar_birth_at timestamptz not null,
  lunar_year integer not null,
  lunar_month integer not null,
  lunar_day integer not null,
  lunar_hour integer not null,
  lunar_minute integer not null,
  lunar_second integer not null,
  birth_place text not null default '',
  birth_place_label text,
  birth_place_latitude double precision,
  birth_place_longitude double precision,
  birth_place_timezone text,
  birth_place_source text,
  birth_place_provider_place_id text,
  uses_true_solar_time boolean not null default false,
  is_primary boolean not null default false,
  source text not null default 'manual',
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (user_id, profile_id)
);--> statement-breakpoint
create unique index if not exists user_birth_profile_records_one_primary
on public.user_birth_profile_records (user_id)
where is_primary;--> statement-breakpoint
create index if not exists user_birth_profile_records_user_updated_at_idx
on public.user_birth_profile_records (user_id, updated_at);--> statement-breakpoint
alter table public.user_birth_profile_records enable row level security;--> statement-breakpoint
drop policy if exists "Users can read their own birth profile records" on public.user_birth_profile_records;--> statement-breakpoint
create policy "Users can read their own birth profile records"
on public.user_birth_profile_records
for select
using ((select auth.uid()) = user_id);--> statement-breakpoint
drop policy if exists "Users can insert their own birth profile records" on public.user_birth_profile_records;--> statement-breakpoint
create policy "Users can insert their own birth profile records"
on public.user_birth_profile_records
for insert
with check ((select auth.uid()) = user_id);--> statement-breakpoint
drop policy if exists "Users can update their own birth profile records" on public.user_birth_profile_records;--> statement-breakpoint
create policy "Users can update their own birth profile records"
on public.user_birth_profile_records
for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);--> statement-breakpoint
drop policy if exists "Users can delete their own birth profile records" on public.user_birth_profile_records;--> statement-breakpoint
create policy "Users can delete their own birth profile records"
on public.user_birth_profile_records
for delete
using ((select auth.uid()) = user_id);--> statement-breakpoint
do $$
begin
  if to_regclass('public.user_birth_profiles') is not null then
    insert into public.user_birth_profile_records (
      user_id,
      profile_id,
      owner_kind,
      display_name,
      relation_note,
      name,
      gender,
      calendar_kind,
      solar_birth_at,
      lunar_year,
      lunar_month,
      lunar_day,
      lunar_hour,
      lunar_minute,
      lunar_second,
      birth_place,
      uses_true_solar_time,
      is_primary,
      source,
      created_at,
      updated_at
    )
    select
      user_id,
      gen_random_uuid(),
      'self',
      name,
      '',
      name,
      gender,
      calendar_kind,
      solar_birth_at,
      lunar_year,
      lunar_month,
      lunar_day,
      lunar_hour,
      lunar_minute,
      lunar_second,
      birth_place,
      false,
      true,
      'legacyMigration',
      updated_at,
      updated_at
    from public.user_birth_profiles legacy
    where not exists (
      select 1
      from public.user_birth_profile_records records
      where records.user_id = legacy.user_id
    );
  end if;
end $$;--> statement-breakpoint
grant select, insert, update, delete
on table public.user_birth_profile_records
to authenticated;--> statement-breakpoint
notify pgrst, 'reload schema';
