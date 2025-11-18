# Hướng dẫn cấu hình MongoDB Atlas

## ✅ Connection String đã được lưu

Connection string của bạn đã được lưu vào file `.env`:
```
mongodb+srv://zuess1357:Nufuri17920051357@sapxeplichhoc.m9o9mra.mongodb.net/smart_scheduler_db?retryWrites=true&w=majority&appName=SapXepLichHoc
```

## ⚠️ QUAN TRỌNG: Whitelist IP Address

**Lỗi kết nối thường do IP chưa được whitelist!**

### Các bước để whitelist IP:

1. **Đăng nhập MongoDB Atlas:**
   - Truy cập: https://cloud.mongodb.com
   - Đăng nhập với tài khoản của bạn

2. **Vào Network Access:**
   - Click vào project của bạn
   - Chọn **"Network Access"** ở menu bên trái

3. **Thêm IP Address:**
   - Click nút **"Add IP Address"**
   - Chọn một trong hai cách:
   
   **Cách 1 (Khuyến nghị cho dev):**
   - Click **"Add Current IP Address"** để thêm IP hiện tại của bạn
   - Click **"Confirm"**
   
   **Cách 2 (Cho phép tất cả - CHỈ DÙNG CHO DEV):**
   - Nhập: `0.0.0.0/0`
   - Click **"Confirm"**
   - ⚠️ Cảnh báo: Cách này cho phép kết nối từ mọi nơi, chỉ dùng khi phát triển!

4. **Đợi vài phút:**
   - Sau khi thêm IP, đợi 1-2 phút để thay đổi có hiệu lực

## 🧪 Test kết nối

Sau khi whitelist IP, test lại:

```powershell
cd smart-scheduler-api
python check_mongodb.py
```

Hoặc chạy API:

```powershell
python main.py
```

Nếu thành công, bạn sẽ thấy:
```
✓ Kết nối MongoDB thành công!
✓ Khởi tạo Beanie hoàn tất.
```

## 📝 Kiểm tra Database User

Đảm bảo database user đã được tạo:

1. Vào MongoDB Atlas → **Database Access**
2. Kiểm tra user `zuess1357` đã tồn tại
3. User phải có quyền **"Read and write to any database"** hoặc ít nhất quyền truy cập database `smart_scheduler_db`

## 🔧 Sửa Connection String

Nếu cần sửa connection string, chỉnh sửa file `.env`:

```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

## 🚀 Sau khi cấu hình xong

1. Whitelist IP address (bước quan trọng nhất!)
2. Đợi 1-2 phút
3. Chạy: `python check_mongodb.py` để test
4. Nếu thành công, chạy: `python main.py` để khởi động API

