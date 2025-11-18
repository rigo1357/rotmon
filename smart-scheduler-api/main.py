# smart-scheduler-api/main.py
import os
import io
import re
import uvicorn
import pandas as pd
import pdfplumber
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
from uuid import UUID
from typing import List, Dict, Any, Optional

# Import các hàm và model đã sửa
from db.database import init_db
from db.models import User, Schedule, Course
from schemas import (
    ChatInput,
    ScheduleInput,
    UserCreate,
    Token,
    CourseBase,
    CourseCreate,
    CourseListResponse,
    CourseUploadResponse,
)
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
    await ensure_default_admin()
    yield
    # (Code dọn dẹp nếu cần, chạy khi tắt server)

app = FastAPI(
    title="Smart Scheduler API",
    lifespan=lifespan
)

# =================
# Cấu hình CORS
# =================
# Cực kỳ quan trọng để React có thể gọi từ bất kỳ port nào
# Trong development, cho phép tất cả localhost ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        # Có thể thêm ports khác nếu cần
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_ADMIN_USERNAME = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "Admin@123")
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@example.com")


async def ensure_default_admin():
    """Đảm bảo luôn có 1 tài khoản admin để quản trị hệ thống."""
    existing_admin = await User.find_one({"username": DEFAULT_ADMIN_USERNAME})
    if existing_admin:
        if not existing_admin.is_admin:
            existing_admin.is_admin = True
            await existing_admin.save()
            print(f"✓ Nâng quyền admin cho {DEFAULT_ADMIN_USERNAME}")
        return

    hashed_password = get_password_hash(DEFAULT_ADMIN_PASSWORD)
    new_admin = User(
        username=DEFAULT_ADMIN_USERNAME,
        email=DEFAULT_ADMIN_EMAIL,
        hashed_password=hashed_password,
        is_admin=True,
    )
    await new_admin.save()
    print("=" * 60)
    print("✓ ĐÃ TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH")
    print(f"Username: {DEFAULT_ADMIN_USERNAME}")
    print(f"Password: {DEFAULT_ADMIN_PASSWORD}")
    print("=" * 60)


async def admin_required(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Chỉ admin mới được phép thực hiện hành động này.")
    return current_user


def _coerce_int(value: Any, default: int = 0) -> int:
    try:
        if value is None or value == "":
            return default
        if isinstance(value, (int, float)):
            return int(value)
        match = re.search(r"\d+", str(value))
        return int(match.group(0)) if match else default
    except Exception:
        return default


def _dataframe_to_courses(df: pd.DataFrame) -> List[Dict[str, Any]]:
    if df.empty:
        return []
    df = df.rename(columns={col: col.strip().lower() for col in df.columns})
    alias_map = {
        "mã môn": "code",
        "mã môn học": "code",
        "ma mon": "code",
        "ma mon hoc": "code",
        "course code": "code",
        "code": "code",
        "ma hp": "code",
        "mã hp": "code",
        "tên môn": "name",
        "tên môn học": "name",
        "ten mon": "name",
        "ten mon hoc": "name",
        "course name": "name",
        "name": "name",
        "tín chỉ": "credits",
        "số tín chỉ": "credits",
        "so tin chi": "credits",
        "credits": "credits",
        "bộ môn": "department",
        "department": "department",
    }
    df = df.rename(columns={col: alias_map.get(col, col) for col in df.columns})

    if "code" not in df.columns or "name" not in df.columns:
        raise ValueError("Không tìm thấy cột 'code' hoặc 'name' trong file.")

    courses = []
    for _, row in df.iterrows():
        code = str(row.get("code", "")).strip()
        name = str(row.get("name", "")).strip()
        if not code or not name:
            continue
        course = {
            "code": code,
            "name": name,
            "credits": _coerce_int(row.get("credits", 0)),
            "department": str(row.get("department") or "").strip() or None,
        }
        courses.append(course)
    return courses


def _parse_pdf_courses(file_bytes: bytes) -> List[Dict[str, Any]]:
    courses: List[Dict[str, Any]] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            for raw_line in text.splitlines():
                line = raw_line.strip()
                if not line:
                    continue
                parts = [p.strip() for p in re.split(r"\s{2,}|\t|\|", line) if p.strip()]
                if len(parts) < 2:
                    continue
                code_candidate = parts[0]
                if not re.match(r"^[A-Za-z]{2,}\d{2,}", code_candidate):
                    continue
                credits = _coerce_int(parts[-1], 0)
                name_parts = parts[1:-1] if credits else parts[1:]
                name = " ".join(name_parts).strip()
                courses.append({
                    "code": code_candidate,
                    "name": name or "Chưa đặt tên",
                    "credits": credits,
                })
    return courses


def parse_course_file(filename: str, file_bytes: bytes) -> List[Dict[str, Any]]:
    suffix = os.path.splitext(filename or "")[1].lower()
    if suffix in [".csv"]:
        text = file_bytes.decode("utf-8-sig")
        df = pd.read_csv(io.StringIO(text))
        return _dataframe_to_courses(df)
    if suffix in [".xls", ".xlsx"]:
        df = pd.read_excel(io.BytesIO(file_bytes))
        return _dataframe_to_courses(df)
    if suffix == ".pdf":
        return _parse_pdf_courses(file_bytes)
    raise ValueError("Định dạng file không được hỗ trợ. Vui lòng dùng PDF, CSV hoặc Excel.")

# =================
# API XÁC THỰC
# =================
@app.post("/api/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """API để đăng ký người dùng mới."""
    try:
        print(f"Đang đăng ký user: {user_data.username}")
        print(f"Password length: {len(user_data.password)} bytes: {len(user_data.password.encode('utf-8'))}")
        
        existing_user = await User.find_one({"username": user_data.username})
        if existing_user:
            raise HTTPException(status_code=400, detail="Username đã tồn tại")
        
        # Hash password với truncation tự động
        try:
            hashed_password = get_password_hash(user_data.password)
            print(f"Hash password thành công")
        except Exception as hash_error:
            print(f"Lỗi khi hash password: {hash_error}")
            raise HTTPException(status_code=500, detail=f"Lỗi khi hash password: {str(hash_error)}")
        
        # Xử lý email - chuyển str thành EmailStr nếu có, hoặc None
        email_value = None
        if user_data.email:
            # Chỉ cần gán trực tiếp, Pydantic sẽ tự validate khi tạo User object
            email_value = user_data.email
        
        new_user = User(
            username=user_data.username,
            email=email_value,  # Có thể là None hoặc str, Pydantic sẽ validate
            hashed_password=hashed_password
        )
        
        await new_user.save()
        print(f"Đã tạo user thành công: {new_user.username}")
        return {"message": f"User {new_user.username} đã được tạo"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Lỗi khi đăng ký user: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")


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
# API QUẢN TRỊ MÔN HỌC
# =================
@app.post("/api/admin/upload-courses", response_model=CourseUploadResponse)
async def upload_courses(
    semester: str = Form(..., description="Ví dụ: 2023-2"),
    department: Optional[str] = Form(default=None),
    major: Optional[str] = Form(default=None),
    file: UploadFile = File(...),
    current_admin: User = Depends(admin_required),
):
    """Admin upload danh sách môn học từ PDF/Excel/CSV."""
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="File tải lên đang trống.")
    try:
        parsed_courses = parse_course_file(file.filename, file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if not parsed_courses:
        raise HTTPException(status_code=400, detail="Không phát hiện môn học hợp lệ trong file.")

    # Xóa dữ liệu cũ của học kỳ này để tránh trùng
    await Course.find_many({"semester": semester}).delete()

    documents = []
    for course in parsed_courses:
        documents.append(
            Course(
                code=course["code"],
                name=course["name"],
                credits=course.get("credits", 0),
                semester=semester,
                department=course.get("department") or department,
                major=course.get("major") or major,
                metadata=course.get("metadata", {}),
                created_by=current_admin.id,
            )
        )

    if documents:
        await Course.insert_many(documents)

    sample = [
        CourseBase(
            code=doc.code,
            name=doc.name,
            credits=doc.credits,
            semester=doc.semester,
            department=doc.department,
            metadata=doc.metadata,
        )
        for doc in documents[:5]
    ]

    return CourseUploadResponse(
        inserted=len(documents),
        semester=semester,
        sample=sample,
    )


@app.get("/api/courses", response_model=CourseListResponse)
async def list_courses(
    semester: Optional[str] = None,
    major: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """Lấy danh sách môn học hiện có (đã upload)."""
    query: Dict[str, Any] = {}
    if semester:
        query["semester"] = semester
    if major:
        query["major"] = major

    courses = await Course.find(query).sort("code").to_list()

    return CourseListResponse(
        total=len(courses),
    items=[
        CourseBase(
            code=course.code,
            name=course.name,
            credits=course.credits,
            semester=course.semester,
            department=course.department,
            major=course.major,
            metadata=course.metadata,
        )
        for course in courses
    ],
    )


@app.post("/api/admin/courses", response_model=CourseBase)
async def create_course(
    course: CourseCreate,
    current_admin: User = Depends(admin_required),
):
    """Thêm hoặc cập nhật nhanh một môn học thủ công."""
    existing = await Course.find_one({"semester": course.semester, "code": course.code})

    if existing:
        existing.name = course.name
        existing.credits = course.credits
        existing.department = course.department
        existing.major = course.major
        existing.metadata = course.metadata or {}
        existing.created_by = current_admin.id
        await existing.save()
        saved = existing
    else:
        new_course = Course(
            code=course.code,
            name=course.name,
            credits=course.credits,
            semester=course.semester,
            department=course.department,
            major=course.major,
            metadata=course.metadata or {},
            created_by=current_admin.id,
        )
        await new_course.save()
        saved = new_course

    return CourseBase(
        code=saved.code,
        name=saved.name,
        credits=saved.credits,
        semester=saved.semester,
        department=saved.department,
        major=saved.major,
        metadata=saved.metadata,
    )

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
        print(f"Số môn học: {len(input.subjects)}")
        
        # 1. Chuẩn hóa dữ liệu và loại bỏ môn trùng thời gian (ưu tiên môn học lại / priority cao)
        def parse_date(value: str) -> datetime.date:
            return datetime.strptime(value, "%Y-%m-%d").date()

        def calc_priority(subject: SubjectInput) -> int:
            base = subject.priority or 5
            if getattr(subject, "is_retake", False):
                base += 2
            return min(10, base)

        entries = []
        for subject in input.subjects:
            try:
                start_date = parse_date(subject.start_date)
                end_date = parse_date(subject.end_date)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Định dạng ngày không hợp lệ cho môn {subject.name}.")
            entries.append({
                "data": subject,
                "priority": calc_priority(subject),
                "start": start_date,
                "end": end_date,
            })

        removed_conflicts = []

        def find_conflicts(items):
            conflicts = []
            for i in range(len(items)):
                for j in range(i + 1, len(items)):
                    a = items[i]
                    b = items[j]
                    if b["start"] <= a["start"] <= b["end"] or a["start"] <= b["start"] <= a["end"]:
                        conflicts.append((a, b))
            return conflicts

        active_entries = entries[:]
        while True:
            conflicts = find_conflicts(active_entries)
            if not conflicts:
                break
            entry_a, entry_b = conflicts[0]
            if entry_a["priority"] > entry_b["priority"]:
                keep_entry, remove_entry = entry_a, entry_b
            elif entry_b["priority"] > entry_a["priority"]:
                keep_entry, remove_entry = entry_b, entry_a
            else:
                # Tie-break: ưu tiên môn học lại, sau đó ưu tiên bắt đầu sớm hơn
                is_retake_a = getattr(entry_a["data"], "is_retake", False)
                is_retake_b = getattr(entry_b["data"], "is_retake", False)
                if is_retake_a and not is_retake_b:
                    keep_entry, remove_entry = entry_a, entry_b
                elif is_retake_b and not is_retake_a:
                    keep_entry, remove_entry = entry_b, entry_a
                elif entry_a["start"] <= entry_b["start"]:
                    keep_entry, remove_entry = entry_a, entry_b
                else:
                    keep_entry, remove_entry = entry_b, entry_a

            removed_conflicts.append({
                "subject": remove_entry["data"].name,
                "kept_with": keep_entry["data"].name,
                "reason": f"{remove_entry['data'].start_date} - {remove_entry['data'].end_date} trùng với {keep_entry['data'].name}",
            })
            active_entries = [entry for entry in active_entries if entry is not remove_entry]

        if not active_entries:
            detail_msg = ", ".join([drop["subject"] for drop in removed_conflicts]) or "không xác định"
            raise HTTPException(
                status_code=400,
                detail=f"Không thể tạo thời khóa biểu vì tất cả môn đều trùng thời gian ({detail_msg})."
            )

        subject_names = [entry["data"].name for entry in active_entries]
        priorities = {entry["data"].name: entry["priority"] for entry in active_entries}
        subject_details = {}
        for entry in active_entries:
            subject = entry["data"]
            subject_details[subject.name] = {
                "instructor": subject.instructor,
                "start_time": subject.start_time,
                "end_time": subject.end_time,
                "start_date": subject.start_date,
                "end_date": subject.end_date,
                "priority": entry["priority"],
                "is_retake": subject.is_retake or False,
            }
        
        # 2. Chuyển đổi additional constraints sang dict
        additional_constraints_dict = {}
        if input.additionalConstraints:
            additional_constraints_dict = {
                'avoidConsecutive': input.additionalConstraints.avoidConsecutive,
                'balanceDays': input.additionalConstraints.balanceDays,
                'preferMorning': input.additionalConstraints.preferMorning,
                'allowSaturday': input.additionalConstraints.allowSaturday
            }
        
        # 3. Chạy GA với dữ liệu đã chuẩn hóa và priorities
        final_schedule, final_cost = find_optimal_schedule(
            subject_names,
            input.available_time_slots if input.available_time_slots else [
                'T2_Sáng', 'T2_Chiều', 'T2_Tối',
                'T3_Sáng', 'T3_Chiều', 'T3_Tối',
                'T4_Sáng', 'T4_Chiều', 'T4_Tối',
                'T5_Sáng', 'T5_Chiều', 'T5_Tối',
                'T6_Sáng', 'T6_Chiều', 'T6_Tối',
                'T7_Sáng', 'T7_Chiều', 'T7_Tối',
                'CN_Sáng', 'CN_Chiều', 'CN_Tối',
            ],
            input.constraints,
            priorities,
            additional_constraints_dict,
            subject_details
        )
        
        # 4. Format kết quả (mỗi môn chỉ có 1 slot)
        formatted_schedule = []
        for item in final_schedule:
            subject_name = item['subject']
            slot_name = item['time']
            info = subject_details[subject_name]
            formatted_schedule.append({
                "subject": subject_name,
                "time": slot_name,
                "instructor": info["instructor"],
                "sessions": 1,
                "start_date": info["start_date"],
                "end_date": info["end_date"],
                "start_time": info["start_time"],
                "end_time": info["end_time"],
                "priority": info["priority"],
                "is_retake": info["is_retake"],
            })
        
        # 5. Tạo đối tượng Schedule
        new_schedule = Schedule(
            user_id=current_user.id,
            schedule_data=formatted_schedule,
            cost=final_cost
        )
        
        # 6. Lưu kết quả vào MongoDB
        await new_schedule.save()
        
        print(f"Đã lưu lịch mới vào DB, ID: {new_schedule.id}")
        
        # 7. Trả kết quả về React
        return {
            "schedule": formatted_schedule,
            "cost": final_cost,
            "db_id": new_schedule.id,
            "removed_conflicts": removed_conflicts,
        }
    
    except Exception as e:
        print(f"Lỗi GA: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý GA: {e}")

# =================
# CHẠY SERVER
# =================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)