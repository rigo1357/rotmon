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
    email: Optional[str] = None  # Dùng str thay vì EmailStr để linh hoạt hơn
    hashed_password: str
    is_admin: bool = False
    
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

# =================
# Model Môn học
# =================
class Course(Document):
    id: UUID = Field(default_factory=uuid4)
    code: str
    name: str
    credits: int = 0
    semester: Optional[str] = None
    department: Optional[str] = None
     major: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_by: Optional[UUID] = None
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Settings:
        name = "courses"