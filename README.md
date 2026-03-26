# Sổ thu hoạch kinh nghiệm
## 2026/03/26:

**I. Sắp xếp file trong folder repo offline**<br><br>
***1. Nguyên tắc***
- Mọi file trong thư mục repo đều bị Git theo dõi và sẽ bị push lên trừ khi được ignore.
- Thêm `.gitignore` ngay khi tạo repo (đó là commit đầu tiên luôn).
- `.gitignore` không thể dùng chung giữa các branch. Mỗi branch phải có `.gitignore` riêng (VD: thêm ở branch `soil-samples` không có tác dụng trên `main`).

***2. File không nên để trong thư mục repo***: file zip, doc, pdf tạm thời; file đang chỉnh sửa dở; file backup.<br>
<b><i>Chỉ để trong thư mục repo những gì muốn push.</i></b>

***3. Lỡ push file không mong muốn***
- Git Bash: Lệnh bỏ file ra khỏi repo
```bash
git rm 'tên-file.zip'
git commit -m 'Xoá file .zip'
git push
```
Tuy file không còn trong repo nhưng <b><i>toàn bộ nội dung</i></b> vẫn còn trong lịch sử commit. Ai cũng có thể vào commit để download.
- Git Bash: Lệnh xoá hẳn file zip trong lịch sử commit:
```
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch 'tên-file.zip'" \
  --prune-empty --tag-name-filter cat -- --all
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```
**II. Deploy web app có thể chạy offline lên GitHub**<br><br>
***1. Bối cảnh***
- `navigator.geolocation` chỉ hoạt động trên `https://` - không dùng được khi mở file HTML trực tiếp từ máy do bảo mật của Android 10 trở đi.

***2. Giải pháp***
- Host file lên GitHub Pages để có HTTPS miễn phí, sau đó thêm service Worker để chạy offline sau lần đầu sử dụng online.

a) Tạo repo trên GitHub:
- Mỗi project tạo một branch độc lập trong cùng một repo:
+ `main`: chứa file phục vụ thông tin chung
+ `soil-samples`: chuyên phục vụ việc phân tích đất (VD: deploy biểu mẫu điện tử) 

b) Thêm Service Worker (SW):
- SW chỉ đăng ký được trên `https://`, không chạy trên `file://`.
- Không thể nhúng SW dạng Blob URL vào 1 file HTML duy nhất (bị browser chặn)
- do đó, phải tách thành 2 file riêng: `.html` + `sw.js`.
- Shortcut ngoài homescreen phải được tạo <i>sau</i> khi SW đã đăng kí lần đầu.

c) Hướng dẫn cho nhân viên:
- Bật internet → mở URL lần đầu.
- Tạo shortcut ra homescreen.
- Từ đó dùng offline bình thường.