# Hướng dẫn khắc phục các vấn đề

## ✅ Đã khắc phục

### 1. React Dependencies (react-scripts)
**Vấn đề**: `react-scripts` không được nhận diện
**Giải pháp**: Đã cài đặt lại dependencies thành công
```bash
cd smart-scheduler-ui
npm install
```

### 2. Python Dependencies (fastapi)
**Vấn đề**: Không tìm thấy package `fastapi`
**Giải pháp**: Đã cài đặt thành công với Python 3.13
```bash
cd smart-scheduler-api
pip install -r requirements.txt
```

## 🔧 MongoDB Connection

### Kiểm tra MongoDB đang chạy

**Windows:**
1. Mở Services (Win + R → `services.msc`)
2. Tìm "MongoDB" và kiểm tra trạng thái "Running"
3. Hoặc chạy từ Command Prompt:
   ```bash
   mongod
   ```

**Hoặc cài đặt MongoDB:**
- Tải từ: https://www.mongodb.com/try/download/community
- Hoặc sử dụng MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Sử dụng MongoDB Atlas (Khuyến nghị)

1. Tạo tài khoản tại https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Lấy connection string
4. Set biến môi trường:
   ```powershell
   $env:MONGODB_URL="mongodb+srv://username:password@cluster.mongodb.net/dbname"
   ```

### Test kết nối MongoDB

Sau khi MongoDB đã chạy, test API:
```bash
cd smart-scheduler-api
python main.py
```

Nếu kết nối thành công, bạn sẽ thấy:
```
✓ Kết nối MongoDB thành công!
✓ Khởi tạo Beanie hoàn tất.
```

## 🚀 Chạy ứng dụng

### 1. Chạy API Backend
```bash
cd smart-scheduler-api
python main.py
```
API sẽ chạy tại: http://localhost:8000

### 2. Chạy React Frontend
```bash
cd smart-scheduler-ui
npm start
```
UI sẽ mở tại: http://localhost:3000

## 📝 Lưu ý

- Đảm bảo MongoDB đang chạy TRƯỚC KHI khởi động API
- Nếu gặp lỗi port đã được sử dụng, đổi port trong code hoặc tắt ứng dụng đang dùng port đó
- API và UI phải chạy đồng thời để ứng dụng hoạt động đầy đủ

