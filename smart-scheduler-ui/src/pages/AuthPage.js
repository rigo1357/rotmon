// src/pages/AuthPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const features = [
  { title: 'Tạo lịch thông minh', description: 'Ưu tiên môn quan trọng, cân bằng thời khóa biểu của bạn.' },
  { title: 'Giáo trình cập nhật', description: 'Môn học được admin upload từ PDF/Excel/CSV chính thức.' },
  { title: 'Chatbot trợ lý', description: 'Giải đáp mọi câu hỏi về đăng ký học phần hoặc GA.' },
];

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin@123';

function AuthPage() {
  const [mode, setMode] = useState('login'); // login | register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  const { login } = useAuth();

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setAuthMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  const fillAdminCredentials = () => {
    setMode('login');
    setUsername(ADMIN_USERNAME);
    setPassword(ADMIN_PASSWORD);
    setConfirmPassword(ADMIN_PASSWORD);
    setAuthMessage('Đã tự động điền tài khoản quản trị mặc định.');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthMessage('');
    const success = await login(username.trim(), password);
    if (!success) {
      setAuthMessage('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.');
    }
    setIsSubmitting(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthMessage('');

    if (password.length < 6) {
      setAuthMessage('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        username: username.trim(),
        password,
        email: email.trim() || null,
      };
      const response = await api.post('/api/register', payload);
      if (response.status === 201) {
        setAuthMessage('🎉 Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
        switchMode('login');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setEmail('');
      }
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        setAuthMessage(detail.map((err) => `${err.loc?.join('.')}: ${err.msg}`).join('\n'));
      } else if (typeof detail === 'string') {
        setAuthMessage(detail);
      } else if (error.response?.data?.message) {
        setAuthMessage(error.response.data.message);
      } else {
        setAuthMessage(error.message || 'Có lỗi không xác định.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = ({
    label,
    type = 'text',
    placeholder = '',
    value,
    onChange,
    required,
    addon,
  }) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', color: '#94a3b8', marginBottom: '6px', fontSize: '14px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '14px',
            border: '1px solid rgba(148,163,184,0.4)',
            backgroundColor: 'rgba(15,23,42,0.6)',
            color: '#e2e8f0',
            fontSize: '15px',
          }}
        />
        {addon}
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top,#0ea5e9,#0f172a 55%,#020617)',
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          background: 'rgba(15,23,42,0.9)',
          borderRadius: '32px',
          padding: '40px',
          boxShadow: '0 40px 80px rgba(2,6,23,0.8)',
          border: '1px solid rgba(148,163,184,0.2)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
        }}
      >
        <div style={{ color: '#e2e8f0' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>Smart Scheduler</h1>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
            Tối ưu thời khóa biểu, tiết kiệm thời gian đăng ký học phần với trợ lý thông minh.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
            {features.map((feature) => (
              <div key={feature.title} style={{ background: 'rgba(2,6,23,0.6)', padding: '16px', borderRadius: '18px', border: '1px solid rgba(148,163,184,0.15)' }}>
                <h4 style={{ margin: 0 }}>{feature.title}</h4>
                <p style={{ margin: '6px 0 0', color: '#94a3b8' }}>{feature.description}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(15,118,110,0.2)', border: '1px solid rgba(45,212,191,0.4)', borderRadius: '18px', padding: '18px' }}>
            <h4 style={{ marginTop: 0, color: '#34d399' }}>Tài khoản quản trị mặc định</h4>
            <p style={{ margin: '6px 0', color: '#a7f3d0' }}>
              Username: <strong>{ADMIN_USERNAME}</strong> – Password: <strong>{ADMIN_PASSWORD}</strong>
            </p>
            <button
              type="button"
              onClick={fillAdminCredentials}
              style={{
                marginTop: '10px',
                padding: '10px 18px',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg,#34d399,#10b981)',
                color: '#0f172a',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Điền thông tin admin
            </button>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(2,6,23,0.7)',
            borderRadius: '26px',
            padding: '32px',
            border: '1px solid rgba(148,163,184,0.25)',
            boxShadow: 'inset 0 0 35px rgba(8,47,73,0.45)',
          }}
        >
          <div style={{ display: 'flex', marginBottom: '24px', background: 'rgba(15,23,42,0.8)', borderRadius: '999px', padding: '6px' }}>
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                flex: 1,
                border: 'none',
                borderRadius: '999px',
                padding: '10px 0',
                background: mode === 'login' ? 'linear-gradient(135deg,#38bdf8,#22d3ee)' : 'transparent',
                color: mode === 'login' ? '#0f172a' : '#94a3b8',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              style={{
                flex: 1,
                border: 'none',
                borderRadius: '999px',
                padding: '10px 0',
                background: mode === 'register' ? 'linear-gradient(135deg,#f472b6,#fb7185)' : 'transparent',
                color: mode === 'register' ? '#0f172a' : '#94a3b8',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Đăng ký
            </button>
          </div>

          {authMessage && (
            <div
              style={{
                marginBottom: '18px',
                padding: '12px',
                borderRadius: '14px',
                backgroundColor: authMessage.includes('thành công') ? 'rgba(16,185,129,0.2)' : 'rgba(248,113,113,0.15)',
                color: authMessage.includes('thành công') ? '#bbf7d0' : '#fecaca',
                border: authMessage.includes('thành công') ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(248,113,113,0.3)',
                whiteSpace: 'pre-line',
              }}
            >
              {authMessage}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              {renderInput({
                label: 'Tên đăng nhập',
                type: 'text',
                placeholder: 'ví dụ: sinhvien123',
                value: username,
                onChange: (e) => setUsername(e.target.value),
                required: true,
              })}
              {renderInput({
                label: 'Mật khẩu',
                type: showPassword ? 'text' : 'password',
                placeholder: '••••••••',
                value: password,
                onChange: (e) => setPassword(e.target.value),
                required: true,
                addon: (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      color: '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                ),
              })}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '999px',
                  border: 'none',
                  background: 'linear-gradient(135deg,#38bdf8,#22d3ee)',
                  color: '#0f172a',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginTop: '10px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              {renderInput({
                label: 'Tên đăng nhập',
                type: 'text',
                placeholder: 'ví dụ: sinhvien123',
                value: username,
                onChange: (e) => setUsername(e.target.value),
                required: true,
              })}
              {renderInput({
                label: 'Email (tuỳ chọn)',
                type: 'email',
                placeholder: 'name@student.edu.vn',
                value: email,
                onChange: (e) => setEmail(e.target.value),
              })}
              {renderInput({
                label: 'Mật khẩu',
                type: showPassword ? 'text' : 'password',
                placeholder: '••••••••',
                value: password,
                onChange: (e) => setPassword(e.target.value),
                required: true,
                addon: (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      color: '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                ),
              })}
              {renderInput({
                label: 'Xác nhận mật khẩu',
                type: showConfirmPassword ? 'text' : 'password',
                placeholder: 'Nhập lại mật khẩu',
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                required: true,
                addon: (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      color: '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                ),
              })}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '999px',
                  border: 'none',
                  background: 'linear-gradient(135deg,#f472b6,#fb7185)',
                  color: '#0f172a',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginTop: '10px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Đang đăng ký...' : 'Tạo tài khoản'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;