# Hướng dẫn cài đặt và cấu hình MongoDB

## Phương án 1: MongoDB Atlas (Cloud) - KHUYẾN NGHỊ ⭐

Đây là cách dễ nhất và nhanh nhất, không cần cài đặt gì trên máy.

### Bước 1: Tạo tài khoản MongoDB Atlas
1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký tài khoản miễn phí (Free tier)
3. Xác nhận email

### Bước 2: Tạo Cluster
1. Đăng nhập vào MongoDB Atlas
2. Click "Build a Database" → Chọn "Free" (M0)
3. Chọn Cloud Provider và Region (gần Việt Nam nhất)
4. Đặt tên cluster (ví dụ: `smart-scheduler`)
5. Click "Create"

### Bước 3: Tạo Database User
1. Trong Security → Database Access
2. Click "Add New Database User"
3. Chọn "Password" authentication
4. Nhập username và password (LƯU LẠI!)
5. Database User Privileges: chọn "Atlas admin" hoặc "Read and write to any database"
6. Click "Add User"

### Bước 4: Whitelist IP Address
1. Trong Security → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) - cho development
   - Hoặc thêm IP cụ thể của bạn
4. Click "Confirm"

### Bước 5: Lấy Connection String
1. Trong Database → Click "Connect"
2. Chọn "Connect your application"
3. Driver: Python, Version: 3.6 or later
4. Copy connection string (dạng: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Thay `<password>` bằng password bạn đã tạo ở bước 3
6. Thêm tên database vào cuối: `mongodb+srv://username:password@cluster.mongodb.net/smart_scheduler_db`

### Bước 6: Set biến môi trường
Trong PowerShell:
```powershell
$env:MONGODB_URL="mongodb+srv://username:password@cluster.mongodb.net/smart_scheduler_db"
```

Hoặc tạo file `.env` trong thư mục `smart-scheduler-api`:
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/smart_scheduler_db
```

### Bước 7: Chạy lại API
```bash
python main.py
```

---

## Phương án 2: Cài đặt MongoDB Local

### Cách 1: MongoDB Community Server (Windows)

1. **Tải MongoDB:**
   - Truy cập: https://www.mongodb.com/try/download/community
   - Chọn:
     - Version: 7.0 (hoặc mới nhất)
     - Platform: Windows
     - Package: MSI
   - Click "Download"

2. **Cài đặt:**
   - Chạy file `.msi` đã tải
   - Chọn "Complete" installation
   - Chọn "Install MongoDB as a Service"
   - Chọn "Run service as Network Service user"
   - Đảm bảo "Install MongoDB Compass" được chọn (GUI tool)
   - Click "Install"

3. **Kiểm tra:**
   ```powershell
   # Kiểm tra service
   Get-Service -Name MongoDB
   
   # Hoặc test kết nối
   mongosh
   ```

4. **Khởi động MongoDB (nếu chưa tự động):**
   ```powershell
   # Khởi động service
   Start-Service MongoDB
   
   # Hoặc chạy thủ công
   mongod
   ```

### Cách 2: MongoDB via Docker (Nếu có Docker)

```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Cách 3: MongoDB via Chocolatey (Nếu có Chocolatey)

```powershell
choco install mongodb
```

---

## Kiểm tra kết nối

Sau khi cài đặt, test kết nối:

```powershell
# Test local MongoDB
mongosh

# Hoặc test từ Python
python -c "from motor.motor_asyncio import AsyncIOMotorClient; import asyncio; asyncio.run(AsyncIOMotorClient('mongodb://localhost:27017').admin.command('ping'))"
```

---

## Troubleshooting

### Lỗi: "MongoDB service không chạy"
```powershell
# Khởi động service
Start-Service MongoDB

# Hoặc chạy thủ công
mongod --dbpath "C:\data\db"
```

### Lỗi: "Port 27017 đã được sử dụng"
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :27017

# Hoặc đổi port MongoDB
mongod --port 27018
```

### Lỗi: "Thiếu thư mục data"
```powershell
# Tạo thư mục data
New-Item -ItemType Directory -Path "C:\data\db" -Force

# Chạy MongoDB với đường dẫn này
mongod --dbpath "C:\data\db"
```

---

## Khuyến nghị

- **Development/Testing**: Dùng MongoDB Atlas (miễn phí, dễ setup)
- **Production**: Dùng MongoDB Atlas hoặc MongoDB Enterprise
- **Local Development**: Có thể dùng MongoDB local nếu cần offline

