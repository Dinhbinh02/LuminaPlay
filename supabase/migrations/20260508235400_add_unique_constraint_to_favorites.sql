-- Thêm ràng buộc duy nhất cho cặp (user_id, movie_id) trong bảng favorites
-- Điều này cho phép lệnh upsert hoạt động chính xác khi người dùng thêm/xóa phim khỏi danh sách yêu thích

ALTER TABLE public.favorites 
ADD CONSTRAINT favorites_user_id_movie_id_key UNIQUE (user_id, movie_id);
