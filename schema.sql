-- CalorieTracker+ database schema (PostgreSQL / Supabase)
-- Run in Supabase: SQL Editor -> New query -> paste -> Run.
-- Accounts (email + password) are handled by Supabase Auth (auth.users).
-- Never store plain passwords in your own tables.

-- 1) One profile per user (sign-up step 1 + step 2 + profile photo)
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text        not null,
  avatar_url     text,
  daily_goal_kcal int        not null default 2200 check (daily_goal_kcal between 800 and 6000),
  sex            text        check (sex in ('Male','Female')),
  age            int         check (age between 5 and 120),
  height_cm      numeric(5,1) check (height_cm > 0),
  weight_kg      numeric(5,1) check (weight_kg > 0),
  target_kg      numeric(5,1) check (target_kg > 0),
  activity_level text        not null default 'moderate' check (activity_level in ('light','moderate','very')),
  macro_carbs_pct   int not null default 40,
  macro_protein_pct int not null default 30,
  macro_fats_pct    int not null default 30,
  check (macro_carbs_pct + macro_protein_pct + macro_fats_pct = 100),
  water_goal_ml  int         not null default 2500,
  created_at     timestamptz not null default now()
);

-- 2) Meals the user logs (Log tab, Quick Add, Recipes -> Add to Log)
create table public.meals (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  eaten_on   date not null default current_date,
  slot       text not null check (slot in ('Breakfast','Lunch','Snack','Dinner')),
  name       text not null,
  kcal       int  not null check (kcal >= 0),
  carbs_g    numeric(6,1) not null default 0,
  protein_g  numeric(6,1) not null default 0,
  fats_g     numeric(6,1) not null default 0,
  created_at timestamptz not null default now()
);
create index meals_user_day on public.meals (user_id, eaten_on);

-- 3) Water entries (Hydration dialog)
create table public.water_logs (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  logged_on  date not null default current_date,
  ml         int  not null check (ml > 0),
  created_at timestamptz not null default now()
);
create index water_user_day on public.water_logs (user_id, logged_on);

-- 4) Weigh-ins (Analytics -> Weigh-in Telemetry)
create table public.weigh_ins (
  id        bigint generated always as identity primary key,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  logged_on date not null default current_date,
  weight_kg numeric(5,1) not null check (weight_kg > 0),
  unique (user_id, logged_on)
);

-- 5) Recipes (shared catalogue shown in the Recipes tab)
create table public.recipes (
  id        bigint generated always as identity primary key,
  name      text not null,
  tag       text,
  kcal      int  not null,
  carbs_g   numeric(6,1) not null default 0,
  protein_g numeric(6,1) not null default 0,
  fats_g    numeric(6,1) not null default 0,
  minutes   int,
  image_url text
);

-- 6) Daily totals used by Analytics (one row per user per day)
create view public.daily_summary as
select m.user_id, m.eaten_on as day,
       sum(m.kcal)      as kcal,
       sum(m.carbs_g)   as carbs_g,
       sum(m.protein_g) as protein_g,
       sum(m.fats_g)    as fats_g
from public.meals m
group by m.user_id, m.eaten_on;

-- 7) Streaks
-- A day "counts" when the user logs at least one meal. A trigger records it automatically.
-- A new account has no rows here, so its streak is 0.
create table public.daily_activity (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day     date not null,
  primary key (user_id, day)
);

create function public.record_activity() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.daily_activity (user_id, day)
  values (new.user_id, new.eaten_on)
  on conflict do nothing;
  return new;
end $$;

create trigger meals_record_activity
after insert on public.meals
for each row execute function public.record_activity();

-- Current streak = consecutive active days ending today (or yesterday, so the streak
-- is not lost before the user has logged today's first meal).
create function public.current_streak(p_user uuid default auth.uid()) returns int
language sql stable security definer set search_path = public as $$
  with recursive
  start_day as (
    select case when exists (select 1 from daily_activity where user_id = p_user and day = current_date)
                then current_date else current_date - 1 end as d
  ),
  chain(d, n) as (
    select d, 1 from start_day
      where exists (select 1 from daily_activity where user_id = p_user and day = (select d from start_day))
    union all
    select c.d - 1, c.n + 1 from chain c
      where exists (select 1 from daily_activity where user_id = p_user and day = c.d - 1)
  )
  select coalesce(max(n), 0) from chain;
$$;

-- Usage from the app:  select public.current_streak();

-- ---------- Security: each user can only see and change their own rows ----------
alter table public.profiles   enable row level security;
alter table public.meals      enable row level security;
alter table public.water_logs enable row level security;
alter table public.weigh_ins  enable row level security;
alter table public.recipes    enable row level security;
alter table public.daily_activity enable row level security;

create policy "own profile"  on public.profiles   for all using (id = auth.uid())      with check (id = auth.uid());
create policy "own meals"    on public.meals      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own water"    on public.water_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own weigh-ins" on public.weigh_ins for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own activity" on public.daily_activity for select using (user_id = auth.uid());
create policy "recipes readable by signed-in users" on public.recipes for select using (auth.role() = 'authenticated');