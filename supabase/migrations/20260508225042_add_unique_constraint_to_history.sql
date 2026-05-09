-- Thêm ràng buộc UNIQUE cho cặp (user_id, movie_id) để hỗ trợ upsert
alter table public.watch_history add constraint unique_user_movie unique (user_id, movie_id);
