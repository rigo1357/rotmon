// src/pages/SchedulerPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { exportToPDF, exportToExcel } from '../utils/exportSchedule';

const defaultStudyInfo = {
  semester: '',
  major: '',
  maxCredits: '',
  minCredits: '',
};

const defaultFreeTime = {
  T2: { morning: false, afternoon: false, evening: false },
  T3: { morning: false, afternoon: false, evening: false },
  T4: { morning: false, afternoon: false, evening: false },
  T5: { morning: false, afternoon: false, evening: false },
  T6: { morning: false, afternoon: false, evening: false },
  T7: { morning: false, afternoon: false, evening: false },
  CN: { morning: false, afternoon: false, evening: false },
};

const dayTitle = {
  T2: 'Thứ 2',
  T3: 'Thứ 3',
  T4: 'Thứ 4',
  T5: 'Thứ 5',
  T6: 'Thứ 6',
  T7: 'Thứ 7',
  CN: 'Chủ nhật',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  marginTop: '5px',
  borderRadius: '12px',
  border: '1px solid rgba(148,163,184,0.3)',
  backgroundColor: 'rgba(2,6,23,0.8)',
  color: '#e2e8f0',
};

const cardStyle = {
  padding: '15px',
  borderRadius: '16px',
  backgroundColor: 'rgba(15,23,42,0.7)',
  border: '1px solid rgba(148,163,184,0.2)',
};

const checkboxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '10px',
};

const tableHeaderStyle = {
  padding: '12px',
  backgroundColor: '#0f172a',
  borderBottom: '2px solid #22d3ee',
  position: 'sticky',
  top: 0,
};

const tableTimeCellStyle = {
  padding: '12px',
  backgroundColor: 'rgba(15,23,42,0.8)',
  fontWeight: 'bold',
  borderRight: '1px solid rgba(148,163,184,0.2)',
};

const exportButtonStyle = {
  padding: '10px 18px',
  borderRadius: '999px',
  border: 'none',
  backgroundColor: '#22d3ee',
  color: '#0f172a',
  fontWeight: 'bold',
  cursor: 'pointer',
};

function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await api.post('/api/chat', { message: userMessage });
      setMessages([...newMessages, { role: 'bot', content: response.data.reply }]);
    } catch (error) {
      console.error('Lỗi chatbot:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Có lỗi xảy ra khi gửi tin nhắn';
      setMessages([...newMessages, { role: 'bot', content: 'Lỗi: ' + errorMessage }]);
    }
    setIsLoading(false);
  };

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '110px',
            right: '30px',
            width: '320px',
            height: '420px',
            backgroundColor: '#0f172a',
            borderRadius: '18px',
            boxShadow: '0 20px 40px rgba(2, 6, 23, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(148,163,184,0.2)',
            zIndex: 1000,
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(148,163,184,0.2)', color: '#e2e8f0' }}>
            <strong>🤖 Trợ lý Smart Scheduler</strong>
          </div>
          <div style={{ flex: 1, padding: '10px', overflowY: 'auto', color: '#e2e8f0' }}>
            {messages.length === 0 && <p style={{ color: '#94a3b8' }}>Hỏi tôi bất kỳ điều gì về việc xếp lịch nhé!</p>}
        {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <strong style={{ color: msg.role === 'user' ? '#38bdf8' : '#22d3ee' }}>
                  {msg.role === 'user' ? 'Bạn' : 'Bot'}:
                </strong>{' '}
                <span>{msg.content}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px', borderTop: '1px solid rgba(148,163,184,0.2)', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(148,163,184,0.4)',
                backgroundColor: '#020617',
                color: '#e2e8f0',
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg,#38bdf8,#22d3ee)',
                color: '#0f172a',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg,#38bdf8,#22d3ee)',
          color: '#0f172a',
          fontSize: '24px',
          boxShadow: '0 15px 30px rgba(8,145,178,0.35)',
          cursor: 'pointer',
          zIndex: 1000,
        }}
        aria-label="Mở chatbot"
      >
        💬
      </button>
    </>
  );
}

function SectionDivider({ title }) {
  return (
    <div style={{ margin: '30px 0 15px', borderBottom: '1px dashed rgba(148,163,184,0.3)' }}>
      <h3 style={{ color: '#22d3ee' }}>{title}</h3>
    </div>
  );
}

function ConstraintToggle({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px',
        borderRadius: '12px',
        backgroundColor: 'rgba(15,23,42,0.7)',
        border: '1px solid rgba(148,163,184,0.2)',
      }}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function SchedulerForm({ onGenerate }) {
  const [studyInfo, setStudyInfo] = useState(defaultStudyInfo);
  const [freeTime, setFreeTime] = useState(defaultFreeTime);
  const [constraints, setConstraints] = useState({
    avoidConsecutive: true,
    balanceDays: true,
    preferMorning: false,
    allowSaturday: false,
  });
  const [selectedTab, setSelectedTab] = useState('current');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const response = await api.get('/api/courses', { params: { semester: studyInfo.semester } });
        if (!isMounted) return;
        setAvailableSubjects(response.data?.items || []);
        setCoursesError(null);
      } catch (error) {
        console.error('Không tải được môn học:', error);
        if (isMounted) {
          setCoursesError('Không thể tải danh sách môn học. Vui lòng kiểm tra kết nối hoặc upload từ trang Admin.');
        }
      } finally {
        if (isMounted) setIsLoadingCourses(false);
      }
    };
    loadCourses();
    return () => {
      isMounted = false;
    };
  }, [studyInfo.semester]);

  const handleStudyFieldChange = (field, value) => {
    setStudyInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMaxCreditsChange = (value) => {
    if (value === '') {
      setStudyInfo((prev) => ({ ...prev, maxCredits: '', minCredits: '' }));
      return;
    }
    const numeric = parseInt(value, 10);
    if (Number.isNaN(numeric) || numeric < 0) return;
    setStudyInfo((prev) => ({
      ...prev,
      maxCredits: numeric,
      minCredits: Math.floor((numeric * 2) / 3),
    }));
  };

  const calculatePriority = (subject, index, total) => {
    const base = Math.max(1, 10 - index);
    return Math.min(10, base + (subject.is_retake ? 2 : 0));
  };

  const moveSubject = (index, direction) => {
    setSelectedSubjects((prev) => {
      const newList = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newList.length) {
        return prev;
      }
      const [removed] = newList.splice(index, 1);
      newList.splice(targetIndex, 0, removed);
      return newList;
    });
  };

  const handleFreeTimeChange = (day, period) => {
    setFreeTime((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: !prev[day][period],
      },
    }));
  };

  const buildSubjectPayload = (course) => {
    const today = new Date();
    const endDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    return {
      code: course.code,
      displayName: course.name,
      name: `${course.code} - ${course.name}`,
      credits: course.credits || 3,
      instructor: course.department || '',
      start_time: '07:00',
      end_time: '11:30',
      start_date: today.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      subject_type: 'Lý thuyết',
    };
  };

  const handleSubjectToggle = (course) => {
    setSelectedSubjects((prev) => {
      const exists = prev.find((item) => item.code === course.code);
      if (exists) {
        return prev.filter((item) => item.code !== course.code);
      }
      const isRetake = selectedTab === 'retake';
      return [
        ...prev,
        {
          ...buildSubjectPayload(course),
          is_retake: isRetake,
        },
      ];
    });
  };

  const selectedCodes = selectedSubjects.map((subject) => subject.code);

  const filteredSubjects = availableSubjects.filter((course) => {
    if (!searchText) return true;
    const target = `${course.code} ${course.name}`.toLowerCase();
    return target.includes(searchText.toLowerCase());
  });

  const handleGenerate = () => {
    if (selectedSubjects.length === 0) {
      alert('Vui lòng chọn ít nhất một môn học!');
      return;
    }
    const availableSlots = [];
    const slotMap = { morning: 'Sáng', afternoon: 'Chiều', evening: 'Tối' };
    Object.keys(freeTime).forEach((day) => {
      Object.entries(slotMap).forEach(([key, label]) => {
        if (freeTime[day]?.[key]) {
          availableSlots.push(`${day}_${label}`);
        }
      });
    });

    const subjectsWithPriority = selectedSubjects.map((subject, index) => ({
      ...subject,
      priority: calculatePriority(subject, index, selectedSubjects.length),
    }));

    onGenerate({
      studyInfo,
      subjects: subjectsWithPriority,
      availableSlots,
      constraints: {},
      additionalConstraints: constraints,
    });
  };

  const displayedSubjects = filteredSubjects;

  return (
    <div
      style={{
        padding: '30px',
        borderRadius: '30px',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(2,6,23,0.95))',
        color: '#e2e8f0',
        boxShadow: '0 40px 80px rgba(2,6,23,0.6)',
        border: '1px solid rgba(148,163,184,0.2)',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>1. Thông tin học tập</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '15px' }}>
        <div>
          <label>Học kỳ *</label>
          <input
            type="text"
            placeholder="VD: 2023-2"
            value={studyInfo.semester}
            onChange={(e) => handleStudyFieldChange('semester', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label>Chuyên ngành (tuỳ chọn)</label>
          <input
            type="text"
            placeholder="VD: CNTT"
            value={studyInfo.major}
            onChange={(e) => handleStudyFieldChange('major', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label>Số tín chỉ tối đa *</label>
          <input
            type="number"
            min="0"
            placeholder="VD: 18"
            value={studyInfo.maxCredits}
            onChange={(e) => handleMaxCreditsChange(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label>Số tín chỉ tối thiểu (2/3 tối đa)</label>
          <input
            type="number"
            value={studyInfo.minCredits}
            readOnly
            placeholder="Tự động tính"
            style={{ ...inputStyle, backgroundColor: 'rgba(15,23,42,0.4)' }}
          />
        </div>
      </div>

      <SectionDivider title="2. Thời gian rảnh" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px' }}>
        {Object.keys(freeTime).map((day) => (
          <div key={day} style={cardStyle}>
            <h4 style={{ margin: 0, color: '#22d3ee' }}>{dayTitle[day]}</h4>
            <label style={checkboxStyle}>
              <input type="checkbox" checked={freeTime[day].morning} onChange={() => handleFreeTimeChange(day, 'morning')} />
              <span>Sáng (7:30 - 11:15)</span>
            </label>
            <label style={checkboxStyle}>
              <input type="checkbox" checked={freeTime[day].afternoon} onChange={() => handleFreeTimeChange(day, 'afternoon')} />
              <span>Chiều (12:30 - 16:15)</span>
            </label>
            <label style={checkboxStyle}>
              <input type="checkbox" checked={freeTime[day].evening} onChange={() => handleFreeTimeChange(day, 'evening')} />
              <span>Tối (17:30 - 21:15)</span>
            </label>
          </div>
        ))}
      </div>

      <SectionDivider title="3. Chọn môn học" />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        {['retake', 'current'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              padding: '10px 25px',
              borderRadius: '999px',
              border: 'none',
              background: selectedTab === tab ? '#f472b6' : 'rgba(15,23,42,0.6)',
              color: '#0f172a',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: selectedTab === tab ? '0 10px 25px rgba(236,72,153,0.35)' : 'none',
            }}
          >
            {tab === 'retake' ? 'Môn học Lại' : 'Môn học hiện tại'}
          </button>
        ))}
      </div>
      {selectedTab === 'retake' && (
        <p style={{ marginTop: 0, color: '#94a3b8' }}>
          Gợi ý: chọn những môn bạn muốn học lại hoặc cần cải thiện điểm số. Danh sách môn học tự động đồng bộ từ trang quản trị.
        </p>
      )}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Tìm kiếm mã hoặc tên môn..."
          style={{ ...inputStyle, borderRadius: '999px' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '16px', padding: '10px' }}>
          {isLoadingCourses ? (
            <p>Đang tải danh sách môn học...</p>
          ) : coursesError ? (
            <p style={{ color: '#f87171' }}>{coursesError}</p>
          ) : displayedSubjects.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Không có môn học nào khớp với tìm kiếm.</p>
          ) : (
            displayedSubjects.map((course) => {
              const selected = selectedCodes.includes(course.code);
              return (
                <label
                  key={course.code}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    backgroundColor: selected ? 'rgba(59,130,246,0.25)' : 'rgba(15,23,42,0.6)',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <strong>{course.code}</strong> - {course.name}
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>{course.credits || 0} tín chỉ</div>
                  </div>
                  {selectedTab === 'current' ? (
                    <input type="checkbox" checked={selected} onChange={() => handleSubjectToggle(course)} />
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>Đang xem</span>
                  )}
                </label>
              );
            })
          )}
        </div>
        <div style={{ border: '1px solid rgba(148,163,184,0.2)', borderRadius: '16px', padding: '15px', backgroundColor: 'rgba(15,23,42,0.7)' }}>
          <h4 style={{ marginTop: 0 }}>Môn đã chọn ({selectedSubjects.length})</h4>
          {selectedSubjects.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Chưa chọn môn nào.</p>
          ) : (
            <div>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>Đưa môn lên cao để tăng ưu tiên (dòng trên cùng ưu tiên cao nhất).</p>
              {selectedSubjects.map((subject, index) => {
                const priorityValue = calculatePriority(subject, index, selectedSubjects.length);
                return (
                  <div
                    key={subject.code}
                    style={{
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(148,163,184,0.2)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <strong>{subject.name}</strong>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                        {subject.credits} tín chỉ • Ưu tiên {priorityValue}/10 {subject.is_retake && '• Môn học lại'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <button
                        onClick={() => moveSubject(index, -1)}
                        disabled={index === 0}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: index === 0 ? '#475569' : '#34d399',
                          color: '#0f172a',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        ↑ Ưu tiên
                      </button>
                      <button
                        onClick={() => moveSubject(index, 1)}
                        disabled={index === selectedSubjects.length - 1}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: index === selectedSubjects.length - 1 ? '#475569' : '#fb7185',
                          color: '#0f172a',
                          cursor: index === selectedSubjects.length - 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        ↓ Giảm ưu tiên
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SectionDivider title="4. Ràng buộc bổ sung" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '15px' }}>
        <ConstraintToggle
          label="Tránh xếp các môn học liên tiếp"
          checked={constraints.avoidConsecutive}
          onChange={(checked) => setConstraints({ ...constraints, avoidConsecutive: checked })}
        />
        <ConstraintToggle
          label="Cân bằng số môn học giữa các ngày"
          checked={constraints.balanceDays}
          onChange={(checked) => setConstraints({ ...constraints, balanceDays: checked })}
        />
        <ConstraintToggle
          label="Ưu tiên học buổi sáng"
          checked={constraints.preferMorning}
          onChange={(checked) => setConstraints({ ...constraints, preferMorning: checked })}
        />
        <ConstraintToggle
          label="Cho phép học thứ 7"
          checked={constraints.allowSaturday}
          onChange={(checked) => setConstraints({ ...constraints, allowSaturday: checked })}
        />
      </div>

      <div style={{ marginTop: '25px', textAlign: 'center' }}>
        <button
          onClick={handleGenerate}
          disabled={selectedSubjects.length === 0}
          style={{
            padding: '16px 40px',
            borderRadius: '999px',
            border: 'none',
            background: selectedSubjects.length === 0 ? '#475569' : 'linear-gradient(135deg,#34d399,#10b981)',
            color: '#0f172a',
            fontSize: '18px',
            fontWeight: 'bold',
            letterSpacing: '0.08em',
            cursor: selectedSubjects.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: selectedSubjects.length === 0 ? 'none' : '0 20px 40px rgba(16,185,129,0.35)',
          }}
        >
          Tạo thời khóa biểu
        </button>
      </div>
    </div>
  );
}

function ScheduleTable({ schedule }) {
  if (!schedule || !schedule.schedule) return null;
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const sessions = ['Sáng', 'Chiều', 'Tối'];
  const sessionTimes = {
    Sáng: ['07:30', '08:15', '09:00', '09:45', '10:30', '11:15'],
    Chiều: ['12:30', '13:15', '14:00', '14:45', '15:30', '16:15'],
    Tối: ['17:30', '18:15', '19:00', '19:45', '20:30', '21:15'],
  };

  const scheduleMap = {};
  schedule.schedule.forEach((item) => {
    const slot = item.time;
    if (!scheduleMap[slot]) {
      scheduleMap[slot] = [];
    }
    scheduleMap[slot].push(item);
  });

  return (
    <div style={{ marginTop: '20px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'rgba(15,23,42,0.95)', color: '#e2e8f0' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Buổi</th>
            {days.map((day) => (
              <th key={day} style={tableHeaderStyle}>
                {dayTitle[day]}
              </th>
            ))}
            <th style={tableHeaderStyle}>Khung giờ (45' / tiết)</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session}>
              <td style={tableTimeCellStyle}>{session}</td>
              {days.map((day) => {
                const key = `${day}_${session}`;
                const items = scheduleMap[key] || [];
                return (
                  <td key={key} style={{ padding: '12px', minWidth: '150px', border: '1px solid rgba(148,163,184,0.15)', verticalAlign: 'top' }}>
                    {items.length === 0 ? (
                      <span style={{ color: '#475569', fontStyle: 'italic' }}>Trống</span>
                    ) : (
                      items.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: item.is_retake ? 'rgba(251,113,133,0.2)' : 'rgba(59,130,246,0.2)',
                            borderLeft: `4px solid ${item.is_retake ? '#fb7185' : '#38bdf8'}`,
                            borderRadius: '10px',
                            padding: '8px',
                            marginBottom: '8px',
                          }}
                        >
                          <strong>{item.subject}</strong>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>GV: {item.instructor || 'Chưa cập nhật'}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {item.start_time} - {item.end_time} • Ưu tiên: {item.priority}/10
                          </div>
                          {item.is_retake && <div style={{ fontSize: '11px', color: '#fda4af' }}>Môn học lại</div>}
                        </div>
                      ))
                    )}
                  </td>
                );
              })}
              <td style={{ padding: '12px', border: '1px solid rgba(148,163,184,0.15)', color: '#a5b4fc' }}>
                {sessionTimes[session].join(' → ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Scheduler() {
  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  const handleGenerate = async (formData) => {
    setIsLoading(true);
    try {
      const payloadSubjects = formData.subjects.map((subject) => ({
        name: subject.name,
        start_time: subject.start_time,
        end_time: subject.end_time,
        credits: subject.credits,
        subject_type: subject.subject_type,
        instructor: subject.instructor,
        start_date: subject.start_date,
        end_date: subject.end_date,
        priority: subject.priority,
        is_retake: subject.is_retake || false,
      }));

      const response = await api.post('/api/schedule', {
        subjects: payloadSubjects,
        available_time_slots: formData.availableSlots,
        constraints: formData.constraints,
        additionalConstraints: formData.additionalConstraints,
      });
      setSchedule(response.data);
      setConflicts(response.data.removed_conflicts || []);
    } catch (error) {
      console.error('Lỗi tạo lịch học:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Có lỗi xảy ra khi tạo lịch học';
      alert('Lỗi: ' + errorMessage);
      setConflicts([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SchedulerForm onGenerate={handleGenerate} />
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#22d3ee' }}>
          <h3>Đang chạy giải thuật di truyền...</h3>
        </div>
      )}
      {conflicts.length > 0 && (
        <div style={{ marginTop: '20px', padding: '15px', borderRadius: '12px', backgroundColor: '#2f1f2f', border: '1px solid rgba(248,113,113,0.4)', color: '#fecaca' }}>
          <strong>Các môn đã bị loại bỏ do trùng thời gian:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '18px' }}>
            {conflicts.map((item, idx) => (
              <li key={`${item.subject}-${idx}`}>
                {item.subject} ({item.reason})
              </li>
            ))}
          </ul>
        </div>
      )}

      {schedule && !isLoading && (
        <div style={{ marginTop: '30px', padding: '20px', borderRadius: '24px', backgroundColor: 'rgba(2,6,23,0.8)', color: '#e2e8f0', border: '1px solid rgba(148,163,184,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Thời khóa biểu đề xuất (Cost: {schedule.cost})</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => exportToPDF(schedule.schedule, 'Thoi_khoa_bieu')} style={exportButtonStyle}>
                📄 PDF
              </button>
              <button onClick={() => exportToExcel(schedule.schedule, 'Thoi_khoa_bieu')} style={exportButtonStyle}>
                📊 Excel
      </button>
            </div>
          </div>
          <ScheduleTable schedule={schedule} />
          {schedule.removed_conflicts?.length > 0 && (
            <div style={{ marginTop: '20px', padding: '15px', borderRadius: '16px', backgroundColor: 'rgba(120,53,15,0.2)', border: '1px solid rgba(251,191,36,0.4)', color: '#fde68a' }}>
              <strong>Một số môn đã bị loại do trùng thời gian:</strong>
              <ul>
                {schedule.removed_conflicts.map((item, idx) => (
                  <li key={idx}>
                    {item.subject} (giữ lại {item.kept_with}): {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function SchedulerPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', padding: '30px', background: 'radial-gradient(circle at top,#1e3a8a,#0f172a,#020617)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: '#e2e8f0' }}>
        <div>
          <h1 style={{ margin: 0 }}>Smart Scheduler</h1>
          <p style={{ margin: 0, color: '#94a3b8' }}>Xin chào, {user?.username || 'Bạn'} 👋</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {user?.is_admin && (
            <button
              onClick={() => navigate('/admin')}
              style={{ padding: '10px 18px', borderRadius: '999px', border: 'none', backgroundColor: '#f472b6', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Quản trị môn học
            </button>
          )}
          <button
            onClick={logout}
            style={{ padding: '10px 18px', borderRadius: '999px', border: 'none', backgroundColor: '#22d3ee', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

        <Scheduler />
      <FloatingChatbot />
    </div>
  );
}

export default SchedulerPage;

