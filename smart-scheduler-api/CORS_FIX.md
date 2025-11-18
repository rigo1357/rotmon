# CORS Configuration Fix

## Vấn đề
React app đang chạy trên port 3001 nhưng API chỉ cho phép CORS từ port 3000.

## Giải pháp
Đã cập nhật CORS configuration trong `main.py` để cho phép cả hai ports:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

## Lưu ý
- API server sẽ tự động reload nếu đang chạy với `reload=True`
- Nếu API không tự động reload, restart API server:
  ```bash
  cd smart-scheduler-api
  python main.py
  ```

## Test
Sau khi restart API, thử đăng nhập lại từ React app. Lỗi CORS sẽ biến mất.

