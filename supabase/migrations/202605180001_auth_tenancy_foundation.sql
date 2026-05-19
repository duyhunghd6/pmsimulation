create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key,
  role text not null check (role in ('student', 'instructor')),
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key,
  instructor_id uuid not null references public.profiles(id),
  display_name text not null,
  trigger_mode text not null check (trigger_mode in ('auto', 'manual')),
  current_month_index integer not null check (current_month_index >= 0),
  total_months integer not null check (total_months between 12 and 24),
  student_join_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.class_administrators (
  class_id uuid not null references public.classes(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  primary key (class_id, instructor_id)
);

create table if not exists public.class_enrollments (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  primary key (class_id, student_id)
);

create table if not exists public.funds (
  id uuid primary key,
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  current_aum numeric(14,2) not null,
  risk_appetite_level text not null,
  risk_profile_class text not null,
  investment_time_horizon text not null,
  expected_annual_return numeric(7,4) not null,
  risk_budget numeric(7,4) not null,
  liquidity_buffer numeric(7,4) not null,
  roi numeric(9,4) not null,
  alpha numeric(9,4) not null,
  beta numeric(9,4) not null,
  volatility numeric(9,4) not null,
  sharpe_ratio numeric(9,4) not null,
  treynor_ratio numeric(9,4) not null,
  drawdown numeric(9,4) not null,
  unique (class_id, student_id)
);

create table if not exists public.asset_holdings (
  id uuid primary key,
  fund_id uuid not null references public.funds(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  tier text not null check (tier in ('Base', 'Core', 'Apex')),
  allocation_weight_pct numeric(7,4) not null,
  position_weight numeric(7,4) not null,
  cash_buffer_weight numeric(7,4) not null
);

create table if not exists public.macro_narratives (
  id uuid primary key,
  class_id uuid not null references public.classes(id) on delete cascade,
  month_index integer not null check (month_index >= 0),
  news_headline text not null,
  investment_clock_phase text not null,
  pmi numeric(7,2) not null,
  iip numeric(7,2) not null,
  m2_growth numeric(7,2) not null,
  gdp_growth_yoy numeric(7,2) not null,
  inflation_cpi numeric(7,2) not null,
  policy_rate numeric(7,2) not null,
  bond_yield numeric(7,2) not null,
  interbank_rate numeric(7,2) not null,
  usd_vnd_movement numeric(7,2) not null,
  vix numeric(7,2) not null,
  scenario_persistence text not null,
  unique (class_id, month_index)
);

create table if not exists public.market_metrics (
  id uuid primary key,
  class_id uuid not null references public.classes(id) on delete cascade,
  month_index integer not null check (month_index >= 0),
  vn_index_level numeric(12,2) not null,
  equity_market_trading_value numeric(14,2) not null,
  foreign_investor_net_trading_value numeric(14,2) not null,
  retail_investor_net_trading_value numeric(14,2) not null,
  market_earnings_growth_expectation numeric(7,2) not null,
  valuation_sentiment text not null,
  business_cycle_phase text not null,
  unique (class_id, month_index)
);

create table if not exists public.tracked_metrics (
  id uuid primary key,
  class_id uuid references public.classes(id) on delete cascade,
  fund_id uuid references public.funds(id) on delete cascade,
  scope_type text not null check (scope_type in ('scenario', 'class', 'fund', 'case')),
  scope_id uuid not null,
  month_index integer not null check (month_index >= 0),
  metric_id text not null,
  display_label text not null,
  metric_family text not null,
  value_numeric numeric(14,4),
  value_text text,
  unit text not null,
  source_type text not null,
  source_note text not null,
  convention_note text not null
);

create table if not exists public.tara_orders (
  id uuid primary key,
  fund_id uuid not null references public.funds(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  month_index integer not null check (month_index >= 0),
  target_weights_json jsonb not null,
  estimated_tax_drag numeric(14,2) not null,
  rebalance_trigger text not null,
  status text not null check (status in ('pending', 'processed')),
  unique (fund_id, month_index)
);

create table if not exists public.risk_register_entries (
  id uuid primary key,
  fund_id uuid not null references public.funds(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  month_index integer not null check (month_index >= 0),
  risk_type text not null,
  risk_direction text not null,
  impact_weight numeric(7,4) not null,
  risk_time_lag integer not null,
  risk_probability_score integer not null,
  risk_impact_score integer not null,
  tara_risk_treatment_class text not null,
  risk_treatment_action text not null
);

create table if not exists public.simulation_ledger (
  id uuid primary key,
  fund_id uuid not null references public.funds(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  month_index integer not null check (month_index >= 0),
  market_beta_impact numeric(14,2) not null,
  fee_drag numeric(14,2) not null,
  tax_paid numeric(14,2) not null,
  tax_drag_pct numeric(7,4) not null,
  pvp_slippage_paid numeric(14,2) not null,
  liquidity_penalty_pct numeric(7,4) not null,
  classroom_sell_concentration_pct numeric(7,4) not null,
  ending_aum numeric(14,2) not null,
  unique (fund_id, month_index)
);

create index if not exists funds_class_student_idx on public.funds(class_id, student_id);
create index if not exists asset_holdings_fund_idx on public.asset_holdings(fund_id);
create index if not exists macro_narratives_class_month_idx on public.macro_narratives(class_id, month_index);
create index if not exists market_metrics_class_month_idx on public.market_metrics(class_id, month_index);
create index if not exists tracked_metrics_class_fund_month_idx on public.tracked_metrics(class_id, fund_id, month_index);
create index if not exists tara_orders_fund_month_idx on public.tara_orders(fund_id, month_index);
create index if not exists simulation_ledger_fund_month_idx on public.simulation_ledger(fund_id, month_index);

create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'app_role', '')
$$;

create or replace function public.is_class_admin(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'instructor'
    and exists (
      select 1
      from public.class_administrators admin
      where admin.class_id = target_class_id
        and admin.instructor_id = auth.uid()
    )
$$;

create or replace function public.is_class_student(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'student'
    and exists (
      select 1
      from public.class_enrollments enrollment
      where enrollment.class_id = target_class_id
        and enrollment.student_id = auth.uid()
    )
$$;

create or replace function public.owns_fund(target_fund_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'student'
    and exists (
      select 1
      from public.funds fund
      where fund.id = target_fund_id
        and fund.student_id = auth.uid()
    )
$$;

create or replace function public.administers_fund(target_fund_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'instructor'
    and exists (
      select 1
      from public.funds fund
      join public.class_administrators admin on admin.class_id = fund.class_id
      where fund.id = target_fund_id
        and admin.instructor_id = auth.uid()
    )
$$;

create or replace function public.student_leaderboard_funds(target_class_id uuid)
returns table (
  id uuid,
  class_id uuid,
  student_display_name text,
  current_aum numeric,
  sharpe_ratio numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    fund.id,
    fund.class_id,
    profile.display_name as student_display_name,
    fund.current_aum,
    fund.sharpe_ratio
  from public.funds fund
  join public.profiles profile on profile.id = fund.student_id
  where fund.class_id = target_class_id
    and public.is_class_student(target_class_id)
  order by fund.current_aum desc, fund.sharpe_ratio desc, fund.id asc
$$;

create or replace function public.create_instructor_class(
  target_class_id uuid,
  target_display_name text,
  target_trigger_mode text,
  target_current_month_index integer,
  target_total_months integer,
  target_student_join_code text
)
returns table (
  id uuid,
  instructor_id uuid,
  display_name text,
  trigger_mode text,
  current_month_index integer,
  total_months integer,
  student_join_code text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  requesting_instructor_id uuid := auth.uid();
begin
  if public.current_app_role() <> 'instructor' or requesting_instructor_id is null then
    raise exception 'instructor role required' using errcode = '42501';
  end if;

  insert into public.classes (
    id,
    instructor_id,
    display_name,
    trigger_mode,
    current_month_index,
    total_months,
    student_join_code
  ) values (
    target_class_id,
    requesting_instructor_id,
    btrim(target_display_name),
    target_trigger_mode,
    target_current_month_index,
    target_total_months,
    upper(btrim(target_student_join_code))
  );

  insert into public.class_administrators (class_id, instructor_id)
  values (target_class_id, requesting_instructor_id);

  return query
    select
      c.id,
      c.instructor_id,
      c.display_name,
      c.trigger_mode,
      c.current_month_index,
      c.total_months,
      c.student_join_code
    from public.classes c
    where c.id = target_class_id
      and c.instructor_id = requesting_instructor_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_administrators enable row level security;
alter table public.class_enrollments enable row level security;
alter table public.funds enable row level security;
alter table public.asset_holdings enable row level security;
alter table public.macro_narratives enable row level security;
alter table public.market_metrics enable row level security;
alter table public.tracked_metrics enable row level security;
alter table public.tara_orders enable row level security;
alter table public.risk_register_entries enable row level security;
alter table public.simulation_ledger enable row level security;

grant usage on schema public to authenticated;
grant select on
  public.profiles,
  public.classes,
  public.class_administrators,
  public.class_enrollments,
  public.funds,
  public.asset_holdings,
  public.macro_narratives,
  public.market_metrics,
  public.tracked_metrics,
  public.tara_orders,
  public.risk_register_entries,
  public.simulation_ledger
to authenticated;

grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_class_admin(uuid) to authenticated;
grant execute on function public.is_class_student(uuid) to authenticated;
grant execute on function public.owns_fund(uuid) to authenticated;
grant execute on function public.administers_fund(uuid) to authenticated;
grant execute on function public.student_leaderboard_funds(uuid) to authenticated;
grant execute on function public.create_instructor_class(uuid, text, text, integer, integer, text) to authenticated;

create policy profiles_select_own_or_administered
on public.profiles
for select
using (
  id = auth.uid()
  or exists (
    select 1
    from public.funds fund
    where fund.student_id = profiles.id
      and public.is_class_admin(fund.class_id)
  )
);

create policy classes_select_by_membership_or_admin
on public.classes
for select
using (public.is_class_student(id) or public.is_class_admin(id));

create policy class_administrators_select_own_classes
on public.class_administrators
for select
using (
  public.current_app_role() = 'instructor'
  and (instructor_id = auth.uid() or public.is_class_admin(class_id))
);

create policy class_enrollments_select_by_membership_or_admin
on public.class_enrollments
for select
using (
  (public.current_app_role() = 'student' and student_id = auth.uid())
  or public.is_class_admin(class_id)
);

create policy funds_select_own_or_administered
on public.funds
for select
using (
  (public.current_app_role() = 'student' and student_id = auth.uid())
  or public.is_class_admin(class_id)
);

create policy asset_holdings_select_own_or_instructor_god_mode
on public.asset_holdings
for select
using (public.owns_fund(fund_id) or public.is_class_admin(class_id));

create policy macro_narratives_select_revealed_or_administered
on public.macro_narratives
for select
using (
  public.is_class_admin(class_id)
  or (
    public.is_class_student(class_id)
    and month_index <= (
      select class.current_month_index
      from public.classes class
      where class.id = macro_narratives.class_id
    )
  )
);

create policy market_metrics_select_revealed_or_administered
on public.market_metrics
for select
using (
  public.is_class_admin(class_id)
  or (
    public.is_class_student(class_id)
    and month_index <= (
      select class.current_month_index
      from public.classes class
      where class.id = market_metrics.class_id
    )
  )
);

create policy tracked_metrics_select_scoped
on public.tracked_metrics
for select
using (
  (fund_id is not null and (public.owns_fund(fund_id) or public.administers_fund(fund_id)))
  or (fund_id is null and class_id is not null and (public.is_class_student(class_id) or public.is_class_admin(class_id)))
);

create policy tara_orders_select_student_own_pending_boundary
on public.tara_orders
for select
using (public.owns_fund(fund_id));

create policy risk_register_entries_select_own_or_administered
on public.risk_register_entries
for select
using (public.owns_fund(fund_id) or public.administers_fund(fund_id));

create policy simulation_ledger_select_own_or_administered
on public.simulation_ledger
for select
using (public.owns_fund(fund_id) or public.administers_fund(fund_id));
