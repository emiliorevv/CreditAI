-- MIGRATION: 00001_initial_schema.sql
-- Description: Consolidated initial schema representing the full structured base of the application.
-- Supports: Auth Users, Static Card Models, User Cards (Standard & Custom), Transactions.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

----------------------------------------------------
-- 1. USERS TABLE (Extends Supabase Auth)
----------------------------------------------------
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);


----------------------------------------------------
-- 2. CARD MODELS TABLE (Static Data)
----------------------------------------------------
create table public.card_models (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  issuer text not null,
  benefits jsonb not null default '{}'::jsonb,
  rewards_type text check (rewards_type in ('points', 'cashback')) not null,
  image_url text
);

alter table public.card_models enable row level security;

create policy "Card models are viewable by everyone" on public.card_models
  for select using (true);


----------------------------------------------------
-- 3. USER CARDS TABLE
----------------------------------------------------
create table public.user_cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  model_id uuid references public.card_models(id), -- Nullable for custom cards
  
  -- Custom Card Overrides
  name_override text,
  issuer_override text,
  card_network text,
  custom_benefits jsonb default '{}'::jsonb,
  rewards_type_override text check (rewards_type_override in ('points', 'cashback')),

  -- Financial Settings
  current_balance decimal(12, 2) default 0.00,
  credit_limit decimal(12, 2) not null,
  closing_day integer not null check (closing_day between 1 and 31),
  due_day integer not null check (due_day between 1 and 31),
  created_at timestamptz default now()
);

alter table public.user_cards enable row level security;

-- Strict RLS Policies for user_cards
create policy "Users can view their own cards" on public.user_cards
  for select using (auth.uid() = user_id);

create policy "Users can insert their own cards" on public.user_cards
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own cards" on public.user_cards
  for update using (auth.uid() = user_id);

create policy "Users can delete their own cards" on public.user_cards
  for delete using (auth.uid() = user_id);


----------------------------------------------------
-- 4. TRANSACTIONS TABLE
----------------------------------------------------
create table public.transactions (
    id uuid default uuid_generate_v4() primary key,
    card_id uuid references public.user_cards(id) not null,
    user_id uuid references auth.users(id) not null,
    amount numeric not null,
    description text not null,
    category text default 'General',
    date timestamptz default now(),
    created_at timestamptz default now()
);

create index idx_transactions_card_id on public.transactions(card_id);
create index idx_transactions_date on public.transactions(date);

alter table public.transactions enable row level security;

-- Policies for transactions
create policy "Users can view their own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own transactions" on public.transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own transactions" on public.transactions
  for delete using (auth.uid() = user_id);



----------------------------------------------------
-- 5. FUNCTION & TRIGGERS
----------------------------------------------------

-- Keep user_cards current_balance in sync automatically
create or replace function update_card_balance()
returns trigger as $$
begin
    if (tg_op = 'INSERT') then
        update public.user_cards
        set current_balance = current_balance + new.amount
        where id = new.card_id;
    elsif (tg_op = 'DELETE') then
        update public.user_cards
        set current_balance = current_balance - old.amount
        where id = old.card_id;
    end if;
    return null;
end;
$$ language plpgsql;

create trigger trigger_update_card_balance
after insert or delete on public.transactions
for each row
execute function update_card_balance();

-- Create public.users entry when auth.users is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
