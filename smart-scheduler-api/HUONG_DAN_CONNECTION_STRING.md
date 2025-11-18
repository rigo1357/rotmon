# Hướng dẫn sử dụng MongoDB Connection String

## ✅ Đã thiết lập

Connection string của bạn đã được lưu vào file `.env` trong thư mục `smart-scheduler-api/`

## Cách sử dụng

### Cách 1: Sử dụng file .env (Đã thiết lập sẵn - Khuyến nghị)

File `.env` đã được tạo với connection string của bạn. Code sẽ tự động đọc từ file này.

**Chỉ cần chạy:**
```bash
cd smart-scheduler-api
python main.py
```

### Cách 2: Set biến môi trường trong PowerShell

Nếu muốn set trực tiếp trong PowerShell (chỉ có hiệu lực trong session hiện tại):

```powershell
$env:MONGODB_URL="mongodb+srv://zuess1357:Nufuri17920051357@sapxeplichhoc.m9o9mra.mongodb.net/?appName=SapXepLichHoc"
cd smart-scheduler-api
python main.py
```

### Cách 3: Set biến môi trường vĩnh viễn (Windows)

1. Mở System Properties:
   - Nhấn `Win + R`
   - Gõ `sysdm.cpl` và Enter
   - Tab "Advanced" → "Environment Variables"

2. Thêm biến môi trường:
   - Click "New" trong phần "User variables"
   - Variable name: `MONGODB_URL`
   - Variable value: `mongodb+srv://zuess1357:Nufuri17920051357@sapxeplichhoc.m9o9mra.mongodb.net/?appName=SapXepLichHoc`
   - Click OK

3. Khởi động lại terminal và chạy:
```bash
cd smart-scheduler-api
python main.py
```

## Test kết nối

Để kiểm tra kết nối MongoDB:

```bash
cd smart-scheduler-api
python check_mongodb.py
```

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**: File `.env` chứa thông tin nhạy cảm (username, password). 

- **KHÔNG** commit file `.env` lên Git
- File `.env` đã được thêm vào `.gitignore` (nếu có)
- Chia sẻ connection string cẩn thận

## Sửa connection string

Nếu cần thay đổi connection string, chỉ cần sửa file `.env`:

```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=AppName
```

