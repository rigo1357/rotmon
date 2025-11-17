# smart-scheduler-api/main.py
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
from uuid import UUID

# Import các hàm và model đã sửa
from db.database import init_db
from db.models import User, Schedule
from schemas import ChatInput, ScheduleInput, UserCreate, Token
from auth.security import (
    verify_password, create_access_token, get_password_hash, get_current_user
)
from genetic_algorithm.scheduler_ga import find_optimal_schedule
from chatbot.client import get_bot_response

# =================
# Khởi động & Tắt
# =================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Hàm này sẽ chạy khi server khởi động
    await init_db()
    yield
    # (Code dọn dẹp nếu cần, chạy khi tắt server)

app = FastAPI(
    title="Smart Scheduler API",
    lifespan=lifespan
)

# =================
# Cấu hình CORS
# =================
# Cực kỳ quan trọng để React (port 3000) có thể gọi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # URL của React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =================
# API XÁC THỰC
# =================
@app.post("/api/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """API để đăng ký người dùng mới."""
    existing_user = await User.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username đã tồn tại")
    
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    await new_user.save()
    return {"message": f"User {new_user.username} đã được tạo"}


@app.post("/api/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """API để đăng nhập, trả về JWT token."""
    user = await User.find_one({"username": form_data.username})

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai username hoặc password"
        )
    
    access_token = create_access_token(
        data={"sub": user.username, "id": str(user.id)}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """API để kiểm tra token và lấy thông tin user."""
    return current_user

# =================
# API CHATBOT
# =================
@app.post("/api/chat")
async def handle_chat(
    input: ChatInput,
    current_user: User = Depends(get_current_user) # Bảo vệ API
):
    try:
        reply = await get_bot_response(input.message)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =================
# API XẾP LỊCH
# =================
@app.post("/api/schedule")
async def handle_schedule(
    input: ScheduleInput,
    current_user: User = Depends(get_current_user) # Bảo vệ API
):
    try:
        print(f"Nhận yêu cầu xếp lịch từ user: {current_user.username}")
        
        # 1. Chạy GA
        final_schedule, final_cost = find_optimal_schedule(
            input.subjects, 
            input.time_slots, 
            input.constraints
        )
        
        # 2. Tạo đối tượng Schedule
        new_schedule = Schedule(
            user_id=current_user.id, # Lấy ID user từ token
            schedule_data=final_schedule,
            cost=final_cost
            # created_at đã có default_factory
        )
        
        # 3. Lưu kết quả vào MongoDB
        await new_schedule.save()
        
        print(f"Đã lưu lịch mới vào DB, ID: {new_schedule.id}")
        
        # 4. Trả kết quả về React
        return {"schedule": final_schedule, "cost": final_cost, "db_id": new_schedule.id}
    
    except Exception as e:
        print(f"Lỗi GA: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý GA: {e}")

# =================
# CHẠY SERVER
# =================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)