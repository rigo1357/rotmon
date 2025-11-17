# smart-scheduler-api/db/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from .models import User, Schedule  # Đảm bảo import cả User và Schedule

async def init_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    database = client.smart_scheduler_db

    print("Đang khởi tạo Beanie với MongoDB...")
    
    await init_beanie(
        database=database,
        document_models=[
            User,
            Schedule
        ]
    )
    print("Khởi tạo Beanie hoàn tất.")