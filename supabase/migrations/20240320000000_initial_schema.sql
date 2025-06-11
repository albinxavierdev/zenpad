-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types if needed
create type user_role as enum ('user', 'admin');

-- Create sessions table
create table if not exists public.sessions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    timestamp bigint not null,
    duration integer not null check (duration > 0),
    text text not null default '',
    reflection text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_settings table
create table if not exists public.user_settings (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null unique,
    gemini_api_key text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists sessions_timestamp_idx on public.sessions(timestamp desc);
create index if not exists user_settings_user_id_idx on public.user_settings(user_id);

-- Enable Row Level Security (RLS)
alter table public.sessions enable row level security;
alter table public.user_settings enable row level security;

-- Create policies for sessions table
create policy "Users can view their own sessions"
    on public.sessions for select
    using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
    on public.sessions for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
    on public.sessions for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own sessions"
    on public.sessions for delete
    using (auth.uid() = user_id);

-- Create policies for user_settings table
create policy "Users can view their own settings"
    on public.user_settings for select
    using (auth.uid() = user_id);

create policy "Users can insert their own settings"
    on public.user_settings for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own settings"
    on public.user_settings for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own settings"
    on public.user_settings for delete
    using (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_sessions_updated_at
    before update on public.sessions
    for each row
    execute function public.handle_updated_at();

create trigger handle_user_settings_updated_at
    before update on public.user_settings
    for each row
    execute function public.handle_updated_at();

-- Create function to ensure user_id matches auth.uid() on insert/update
create or replace function public.handle_user_id()
returns trigger as $$
begin
    if new.user_id != auth.uid() then
        raise exception 'user_id must match the authenticated user';
    end if;
    return new;
end;
$$ language plpgsql;

-- Create triggers for user_id validation
create trigger handle_sessions_user_id
    before insert or update on public.sessions
    for each row
    execute function public.handle_user_id();

create trigger handle_user_settings_user_id
    before insert or update on public.user_settings
    for each row
    execute function public.handle_user_id();

-- Grant necessary permissions to authenticated users
grant usage on schema public to authenticated;
grant all on public.sessions to authenticated;
grant all on public.user_settings to authenticated;

-- Add helpful comments
comment on table public.sessions is 'Stores writing sessions for each user';
comment on table public.user_settings is 'Stores user-specific settings like API keys';
comment on column public.sessions.duration is 'Duration of the writing session in minutes';
comment on column public.sessions.text is 'The written content of the session';
comment on column public.sessions.reflection is 'Optional AI-generated reflection on the writing';
comment on column public.user_settings.gemini_api_key is 'User''s Gemini API key for AI features'; 