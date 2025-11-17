# smart-scheduler-api/auth/security.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from db.models import User # Import model User
from schemas import TokenData # Import khuôn TokenData

# --- Cấu hình JWT ---
SECRET_KEY = "DAY_LA_KHOA_BI_MAT_CUA_BAN" # Hãy đổi thành 1 chuỗi ngẫu nhiên
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 ngày

# --- Cấu hình Passlib ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- OAuth2 ---
# /api/login là URL mà React sẽ gửi form login đến
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# --- HÀM HASH MẬT KHẨU ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- HÀM TẠO TOKEN ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- HÀM LẤY USER HIỆN TẠI (QUAN TRỌNG) ---
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Hàm này sẽ được "Depend" (tiêm) vào các API cần bảo vệ.
    Nó giải mã token, lấy user_id và trả về đối tượng User từ DB.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("id")
        
        if username is None or user_id is None:
            raise credentials_exception
        
        token_data = TokenData(username=username, id=user_id)
        
    except JWTError:
        raise credentials_exception
    
    # Truy vấn user từ DB bằng Beanie/UUID
    user = await User.get(UUID(token_data.id))
    
    if user is None:
        raise credentials_exception
        
    return user