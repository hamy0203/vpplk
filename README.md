# vpplk
## Sổ thu hoạch kinh nghiệm

**2026/03/26: Deploy web app offline-capable lên GitHub**

***1. Bối cảnh***
- `navigator.geolocation` chỉ hoạt động trên `https://` - không dùng được khi mở file HTML trực tiếp từ máy do bảo mật của Android 10 trở đi.

***2. Giải pháp***
- Host file lên GitHub Pages để có HTTPS miễn phí, sau đó thêm service Worker để chạy offline sau lần đầu sử dụng online.

a) Tạo repo trên GitHub:
- Mỗi project tạo một branch độc lập trong cùng một repo:
+ 'main': chứa file phục vụ thông tin chung
+ 'soil-samples': chuyên phục vụ việc phân tích đất (hiện tại để deploy biểu mẫu điện tử) 

b) Thêm Service Worker (SW):
- SW chỉ đăng ký được trên 'https://', không chạy trên 'file://'
- Không thể nhúng SW dạng Blob URL vào 1 file HTML duy nhất (bị browser chặn)
- Do đó, phải tách thành 2 file riêng: .html + sw.js
- Shortcut ngoài homescreen phải được tạo <i>sau</i> khi SW đã đăng kí lần đầu.

c) Hướng dẫn cho nhân viên:
- Bật internet → mở URL lần đầu.
- Tạo shortcut ra homescreen.
- Từ đó dùng offline bình thường.