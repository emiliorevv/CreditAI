-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE (Extends Supabase Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  created_at timestamptz default now()
);

-- Enable RLS for users
alter table public.users enable row level security;

-- Policies for users
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- CARD MODELS TABLE (Static Data)
create table public.card_models (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  issuer text not null,
  benefits jsonb not null default '{}'::jsonb, -- e.g. {"dining": 4, "travel": 3}
  rewards_type text check (rewards_type in ('points', 'cashback')) not null,
  image_url text
);

-- Enable RLS for card_models
alter table public.card_models enable row level security;

-- Policies for card_models (Public read-only)
create policy "Card models are viewable by everyone" on public.card_models
  for select using (true);

-- USER CARDS TABLE
create table public.user_cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  model_id uuid references public.card_models(id) not null,
  current_balance decimal(12, 2) default 0.00,
  credit_limit decimal(12, 2) not null,
  closing_day integer not null check (closing_day between 1 and 31),
  due_day integer not null check (due_day between 1 and 31),
  created_at timestamptz default now()
);

-- Enable RLS for user_cards
alter table public.user_cards enable row level security;

-- Policies for user_cards
create policy "Users can view their own cards" on public.user_cards
  for select using (auth.uid() = user_id);

create policy "Users can insert their own cards" on public.user_cards
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own cards" on public.user_cards
  for update using (auth.uid() = user_id);

create policy "Users can delete their own cards" on public.user_cards
  for delete using (auth.uid() = user_id);

-- TRIGGER TO CREATE USER ENTRY ON SIGNUP
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql SECURITY DEFINER;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
