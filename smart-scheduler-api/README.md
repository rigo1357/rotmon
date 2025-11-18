# Smart Scheduler API

API backend cho ứng dụng Smart Scheduler sử dụng FastAPI, MongoDB, và Beanie.

## Yêu cầu

- Python 3.8+
- MongoDB (local hoặc Atlas)
- pip

## Cài đặt

1. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

2. Cấu hình MongoDB:
   - **Local MongoDB**: Đảm bảo MongoDB đang chạy trên `localhost:27017`
   - **MongoDB Atlas**: Set biến môi trường:
     ```bash
     set MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
     ```

3. Chạy server:
```bash
python main.py
```

Server sẽ chạy tại `http://localhost:8000`

## API Endpoints

- `POST /api/register` - Đăng ký user mới
- `POST /api/login` - Đăng nhập và nhận JWT token
- `GET /api/users/me` - Lấy thông tin user hiện tại
- `POST /api/chat` - Chat với AI assistant
- `POST /api/schedule` - Tạo lịch học tối ưu

## Xử lý lỗi MongoDB

Nếu gặp lỗi kết nối MongoDB:
1. Kiểm tra MongoDB đã được cài đặt và đang chạy
2. Windows: Kiểm tra Services hoặc chạy `mongod` từ command prompt
3. Hoặc sử dụng MongoDB Atlas (cloud) và set biến môi trường `MONGODB_URL`

