# Smart Scheduler UI

Giao diện React cho ứng dụng Smart Scheduler.

## Yêu cầu

- Node.js 14+
- npm hoặc yarn

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy ứng dụng:
```bash
npm start
```

Ứng dụng sẽ mở tại `http://localhost:3000`

## Scripts

- `npm start` - Chạy development server
- `npm run build` - Build production
- `npm test` - Chạy tests

## Lưu ý

- Đảm bảo API backend đang chạy tại `http://localhost:8000`
- Nếu gặp lỗi `react-scripts`, thử xóa `node_modules` và `package-lock.json` rồi cài lại:
  ```bash
  Remove-Item -Recurse -Force node_modules
  Remove-Item -Force package-lock.json
  npm install
  ```
