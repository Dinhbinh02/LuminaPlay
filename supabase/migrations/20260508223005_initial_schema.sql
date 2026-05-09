-- 1. Tạo bảng lưu thông tin người dùng (để lưu avatar, tên từ Google)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  email text,
  updated_at timestamp with time zone
);

-- 2. Tạo bảng lưu lịch sử xem phim (Đồng bộ đám mây)
create table public.watch_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  movie_id text not null,
  title text not null,
  poster text,
  slug text not null,
  progress decimal default 0,
  duration decimal default 0,
  episode_num integer,
  season_num integer,
  playback_time decimal,
  watched_at timestamp with time zone default now()
);

-- 3. Tạo bảng phim yêu thích
create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  movie_id text not null,
  title text not null,
  poster text,
  slug text not null,
  created_at timestamp with time zone default now()
);

-- 4. Thiết lập bảo mật (Row Level Security) - Cho phép user chỉ xem/sửa dữ liệu của chính mình
alter table public.profiles enable row level security;
alter table public.watch_history enable row level security;
alter table public.favorites enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can manage own history" on watch_history for all using (auth.uid() = user_id);
create policy "Users can manage own favorites" on favorites for all using (auth.uid() = user_id);

-- 5. Trigger tự động tạo profile khi có user mới đăng ký qua Google
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
