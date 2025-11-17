# smart-scheduler-api/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from uuid import UUID

# --- Khuôn cho User ---
class UserCreate(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    password: str

# --- Khuôn cho Token (Login) ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    id: Optional[str] = None

# --- Khuôn cho Chatbot ---
class ChatInput(BaseModel):
    message: str

# --- Khuôn cho Xếp lịch ---
class ScheduleInput(BaseModel):
    subjects: List[str]       = Field(..., example=["Toán", "Lý", "Hóa"])
    time_slots: List[str]     = Field(..., example=["T2_Sáng", "T2_Chiều", "T3_Sáng"])
    constraints: Dict[str, List[str]] = Field(..., example={"Toán": ["T2_Sáng"]})