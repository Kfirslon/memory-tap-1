-- ============================================
-- Memory Tap Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create memories table
create table if not exists public.memories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  summary text not null,
  category text check (category in ('task', 'reminder', 'idea', 'note')) not null,
  audio_url text,
  is_favorite boolean default false not null,
  is_completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reminder_time timestamp with time zone
);

-- Enable Row Level Security
alter table public.memories enable row level security;

-- Create RLS Policies for memories table
create policy "Users can view their own memories"
  on public.memories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own memories"
  on public.memories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own memories"
  on public.memories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own memories"
  on public.memories for delete
  using (auth.uid() = user_id);

-- Create indexes for performance
create index if not exists memories_user_id_idx on public.memories(user_id);
create index if not exists memories_created_at_idx on public.memories(created_at desc);
create index if not exists memories_category_idx on public.memories(category);
create index if not exists memories_is_completed_idx on public.memories(is_completed);
