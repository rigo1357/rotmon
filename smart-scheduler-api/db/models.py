# smart-scheduler-api/db/models.py
from beanie import Document
from pydantic import Field, EmailStr
from uuid import UUID, uuid4
from typing import Optional, List, Dict, Any
from datetime import datetime # Thêm import này

# =================
# Model Người Dùng
# =================
class User(Document):
    id: UUID = Field(default_factory=uuid4)
    username: str
    email: Optional[EmailStr] = None
    hashed_password: str
    
    class Settings:
        name = "users"

# =================
# Model Lịch Học
# =================
class Schedule(Document):
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID  # Để liên kết với User đã tạo ra nó
    created_at: datetime = Field(default_factory=datetime.now) # Dùng datetime
    
    schedule_data: List[Dict[str, Any]]
    cost: float
    
    class Settings:
        name = "schedules"