// src/pages/AuthPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Import api

function AuthPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Gọi API /api/register (FastAPI)
      const response = await api.post('/api/register', {
        username,
        email,
        password,
      });
      
      if (response.status === 201) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsRegistering(false); // Quay lại tab đăng nhập
      }
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      alert('Lỗi: ' + error.response.data.detail);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <button onClick={() => setIsRegistering(false)} disabled={!isRegistering}>Đăng nhập</button>
        <button onClick={() => setIsRegistering(true)} disabled={isRegistering}>Đăng ký</button>
      </div>

      <hr />

      {isRegistering ? (
        // Form Đăng Ký
        <form onSubmit={handleRegister}>
          <h2>Đăng ký</h2>
          <input type="text" placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '95%', padding: '8px', margin: '5px 0' }} />
          <input type="email" placeholder="Email (không bắt buộc)" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '95%', padding: '8px', margin: '5px 0' }} />
          <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '95%', padding: '8px', margin: '5px 0' }} />
          <button type="submit" style={{ width: '100%', padding: '10px' }}>Đăng ký</button>
        </form>
      ) : (
        // Form Đăng Nhập
        <form onSubmit={handleLogin}>
          <h2>Đăng nhập</h2>
          <input type="text" placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '95%', padding: '8px', margin: '5px 0' }} />
          <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '95%', padding: '8px', margin: '5px 0' }} />
          <button type="submit" style={{ width: '100%', padding: '10px' }}>Đăng nhập</button>
        </form>
      )}
    </div>
  );
}

export default AuthPage;