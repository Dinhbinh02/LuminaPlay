<div>
  <h1>Lumina Play 🎬</h1>
</div>

<br/>

## Giới thiệu tổng quan

Lumina Play là ứng dụng xem phim tốc độ cao, hoạt động mượt mà trên cả giao diện Desktop, Điện thoại, và Chrome Extension. Điểm mạnh nhất của ứng dụng là khả năng **tự động vượt rào nhà mạng và tường lửa**, giúp bạn luôn xem được phim dù đang truy cập từ mạng nội bộ bị chặn hay khi các nhà mạng kiểm duyệt.

**Truy cập web tại:** [https://lumina-play.vercel.app/](https://lumina-play.vercel.app/)

## Tính năng nổi bật

- **Anti-Block & Stealth Proxy**: Giải pháp cho tình trạng bị nhà mạng chặn tên miền hoặc quét từ khóa. Khi phát hiện kết nối thất bại, ứng dụng lập tức chuyển sang dùng proxy: mã hóa Base64 toàn bộ chuỗi URL và cấu hình luồng dữ liệu đi ngầm qua Vercel Proxy.
- **Tốc độ tải trang siêu tốc**: Tích hợp Sticky Proxy để ghi nhớ trạng thái mạng. Kết hợp cùng Skeleton Loading UI giúp giao diện hiển thị mượt mà không độ trễ.
- **Trình phát HLS tối ưu**: Sử dụng `hls.js` hỗ trợ xem video định dạng m3u8 cực mượt. Hỗ trợ tính năng Auto Picture-in-Picture (PiP) khi người dùng chuyển Tab màn hình.
- **Đồng bộ hóa qua GitHub**: Sử dụng GitHub Gist để lưu trữ và đồng bộ hóa "Lịch sử xem phim" xuyên suốt nhiều thiết bị, tự động tiếp tục tại đúng thời lượng đang xem dở.
- **UI/UX thân thiện**: Khung tìm kiếm, bộ lọc trực quan (theo Thể loại, Quốc gia, Danh sách, Năm). Tối ưu hóa 100% hiển thị trên nền tảng thiết bị di động.

## Cấu trúc dự án

- `/api/proxy.js`: Hàm Serverless (deploy trên Vercel) đóng vai trò trung chuyển, vượt rào các API API bị chặn DNS.
- `index.html` / `index.js`: Giao diện chính, danh sách đề xuất tự động.
- `player.html` / `player.js`: Giao diện xem phim, chứa logic điều khiển HLS và logic xử lý luồng Video CDN Direct.
- `player.css`: File thiết kế hệ thống giao diện, hiệu ứng animation.
- `back-nav-hider.js` & `auth-handler.js`: Các service bổ trợ cho việc điều hướng và xác thực người dùng.

## Hướng dẫn phát triển và cài đặt

1. **Clone repository về máy:**
   ```bash
   git clone <link-repo-cua-ban>
   cd LuminaPlay
   ```

2. **Thiết lập biến môi trường (Nếu chạy Proxy tự tổ chức):**
   Bạn cần cập nhật biến số `PRODUCTION_DOMAIN` trong `index.js` và `player.js` về đường dẫn Vercel của chính bạn để Extension không bắt nhầm sang `localhost`.

3. **Deploy lên Vercel:**
   - Đẩy code lên GitHub.
   - Liên kết Repository với Vercel. 
   - Vercel sẽ tự nhận diện `/api/proxy.js` như một Serverless Function để cấp đường truyền Proxy cho bạn.

4. **Sử dụng dưới dạng Chrome Extension:**
   - Mở Chrome, điều hướng tới: `chrome://extensions/`
   - Bật **Developer mode**.
   - Bấm **Load unpacked** và chọn đúng thư mục chứa source code Lumina Play.

---

*Phát triển bởi DinhBinh*
