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
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Lỗi khi gọi Ollama: {e}")
        return "Xin lỗi, tôi đang gặp sự cố kết nối với mô hình AI."