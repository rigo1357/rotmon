"""
Script kiểm tra kết nối MongoDB
Chạy script này để kiểm tra xem MongoDB có đang chạy không
"""
import asyncio
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure

# Load .env file nếu có
def load_env_file():
    """Đọc file .env nếu tồn tại"""
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ[key.strip()] = value.strip()

# Load .env khi chạy script
load_env_file()

async def check_mongodb():
    """Kiểm tra kết nối MongoDB"""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    
    print("=" * 60)
    print("🔍 KIỂM TRA KẾT NỐI MONGODB")
    print("=" * 60)
    print(f"Đang thử kết nối: {mongodb_url}")
    print()
    
    try:
        client = AsyncIOMotorClient(
            mongodb_url,
            serverSelectionTimeoutMS=3000
        )
        
        # Ping server
        await client.admin.command('ping')
        print("✅ THÀNH CÔNG! MongoDB đang chạy và có thể kết nối.")
        print()
        
        # Hiển thị thông tin database
        db_list = await client.list_database_names()
        print(f"📊 Databases có sẵn: {', '.join(db_list) if db_list else '(chưa có)'}")
        
        client.close()
        return True
        
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        print("❌ THẤT BẠI! Không thể kết nối với MongoDB.")
        print(f"\nChi tiết lỗi: {type(e).__name__}")
        print(f"Message: {str(e)[:200]}")
        print()
        print("=" * 60)
        print("📋 HƯỚNG DẪN KHẮC PHỤC")
        print("=" * 60)
        print()
        print("⚠️ Nếu đang dùng MongoDB Atlas, kiểm tra:")
        print("   1. IP Address của bạn đã được whitelist:")
        print("      - Vào MongoDB Atlas → Network Access")
        print("      - Click 'Add IP Address' → 'Add Current IP Address'")
        print("      - Hoặc thêm 0.0.0.0/0 để cho phép tất cả IP (chỉ dùng cho dev)")
        print("   2. Database user đã được tạo và có quyền truy cập")
        print("   3. Connection string đúng format")
        print()
        print()
        print("CÓ 2 CÁCH ĐỂ KHẮC PHỤC:")
        print()
        print("🔹 CÁCH 1: Sử dụng MongoDB Atlas (KHUYẾN NGHỊ - Dễ nhất)")
        print("   1. Truy cập: https://www.mongodb.com/cloud/atlas")
        print("   2. Đăng ký tài khoản miễn phí")
        print("   3. Tạo cluster miễn phí (M0)")
        print("   4. Tạo database user và lấy connection string")
        print("   5. Set biến môi trường:")
        print("      $env:MONGODB_URL=\"mongodb+srv://user:pass@cluster.mongodb.net/dbname\"")
        print()
        print("🔹 CÁCH 2: Cài đặt MongoDB Local")
        print("   1. Tải MongoDB Community Server:")
        print("      https://www.mongodb.com/try/download/community")
        print("   2. Cài đặt với tùy chọn mặc định")
        print("   3. MongoDB sẽ tự động chạy như một Windows Service")
        print("   4. Hoặc chạy thủ công: mongod")
        print()
        print("=" * 60)
        return False
    except Exception as e:
        print(f"❌ Lỗi không xác định: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(check_mongodb())
    if not result:
        exit(1)

