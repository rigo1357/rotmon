// src/pages/SchedulerPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// --- Component Chatbot (Con) ---
function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input) return;
    setIsLoading(true);

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      // Gọi API /api/chat (Token đã được thêm tự động bởi api.js)
      const response = await api.post('/api/chat', { message: input });
      setMessages([...newMessages, { role: 'bot', content: response.data.reply }]);
    } catch (error) {
      console.error('Lỗi chatbot:', error);
      setMessages([...newMessages, { role: 'bot', content: 'Lỗi: ' + error.message }]);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', width: '350px', height: '500px', display: 'flex', flexDirection: 'column' }}>
      <h4>🤖 Trợ lý Chatbot</h4>
      <div style={{ flex: 1, overflowY: 'scroll', border: '1px solid #eee', marginBottom: '10px', padding: '5px' }}>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.role === 'user' ? 'Bạn:' : 'Bot:'}</strong> {msg.content}
          </p>
        ))}
      </div>
      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} disabled={isLoading} />
      <button onClick={handleSend} disabled={isLoading}>{isLoading ? '...' : 'Gửi'}</button>
    </div>
  );
}

// --- Component Xếp lịch (Con) ---
function Scheduler() {
  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    // Đây là dữ liệu cứng (demo), bạn sẽ lấy từ form
    const scheduleInput = {
      subjects: ['Giải tích', 'Đại số', 'Lập trình', 'Triết học', 'Vật lý'],
      time_slots: ['T2_Sáng', 'T2_Chiều', 'T3_Sáng', 'T3_Chiều', 'T4_Sáng', 'T4_Chiều', 'T5_Sáng', 'T5_Chiều', 'T6_Sáng', 'T6_Chiều'],
      constraints: {
        'Giải tích': ['T2_Sáng'], // Cấm học Giải tích vào T2 Sáng
        'Triết học': ['T6_Chiều'], // Cấm học Triết vào T6 Chiều
      },
    };

    try {
      // Gọi API /api/schedule
      const response = await api.post('/api/schedule', scheduleInput);
      setSchedule(response.data); // (Lưu cả { schedule: [...], cost: 0 })
    } catch (error) {
      console.error('Lỗi xếp lịch:', error);
      alert('Lỗi: ' + error.message);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ padding: '10px', flex: 1 }}>
      <h4>🧠 Chức năng Xếp lịch (GA)</h4>
      <p>Nhấn nút để tạo lịch học (sử dụng dữ liệu demo).</p>
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Đang chạy GA...' : 'Tạo lịch học tối ưu'}
      </button>

      {schedule && (
        <div style={{ marginTop: '20px' }}>
          <h4>Kết quả (Cost: {schedule.cost})</h4>
          <table border="1" cellPadding="5">
            <thead>
              <tr><th>Môn học</th><th>Thời gian</th></tr>
            </thead>
            <tbody>
              {schedule.schedule.map((item, index) => (
                <tr key={index}>
                  <td>{item.subject}</td>
                  <td>{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Trang chính (Cha) ---
function SchedulerPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={logout} style={{ float: 'right' }}>Đăng xuất</button>
      <h1>Xin chào, {user?.username || 'bạn'}!</h1>
      <p>Đây là trang ứng dụng chính của Smart Scheduler.</p>
      <hr />
      <div style={{ display: 'flex', gap: '20px' }}>
        <Scheduler />
        <Chatbot />
      </div>
    </div>
  );
}

export default SchedulerPage;