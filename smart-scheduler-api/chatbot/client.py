# smart-scheduler-api/chatbot/client.py
from openai import OpenAI

# 1. Khởi tạo Client (sử dụng 1 lần)
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama" # (Key này không bắt buộc với Ollama)
)

# 2. PROMPT HỆ THỐNG
PROMPT = """
Bạn là "Trợ lý Lịch trình Thông minh" (Smart Scheduler Assistant) trong dự án Smart Scheduler.
Bạn giao tiếp hoàn toàn bằng *tiếng Việt chuyên nghiệp, thân thiện và rõ ràng*.
Nhiệm vụ chính của bạn là hỗ trợ người dùng tạo và quản lý lịch học.
"""

async def get_bot_response(user_message: str):
    """
    Lấy phản hồi từ Ollama.
    """
    try:
        # Đảm bảo Ollama của bạn đang chạy và đã pull model gemma2:2b
        response = client.chat.completions.create(
            model="gemma2:2b", # Dùng model bạn đã chọn
            messages=[
                {"role": "system", "content": PROMPT},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            timeout=30.0  # Timeout 30 giây
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Lỗi khi gọi Ollama: {e}")
        error_msg = str(e).lower()
        
        # Kiểm tra loại lỗi và trả về message phù hợp
        if "connection" in error_msg or "refused" in error_msg:
            return "Xin lỗi, tôi không thể kết nối với mô hình AI. Vui lòng kiểm tra Ollama đã được khởi động chưa (chạy 'ollama serve' trong terminal)."
        elif "timeout" in error_msg:
            return "Xin lỗi, yêu cầu đã hết thời gian chờ. Vui lòng thử lại."
        elif "model" in error_msg or "not found" in error_msg:
            return "Xin lỗi, mô hình AI chưa được tải. Vui lòng chạy 'ollama pull gemma2:2b' trong terminal."
        else:
            return f"Xin lỗi, tôi đang gặp sự cố: {str(e)[:100]}. Vui lòng thử lại sau."