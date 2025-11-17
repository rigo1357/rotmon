// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Import api đã cấu hình

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('access_token'));
  const navigate = useNavigate();

  const login = async (username, password) => {
    try {
      // Backend FastAPI yêu cầu form-data cho login (OAuth2PasswordRequestForm)
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await api.post('/api/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.access_token) {
        // 1. Lưu token vào localStorage
        localStorage.setItem('access_token', response.data.access_token);
        
        // 2. Lấy thông tin user (ví dụ)
        // (Bạn có thể gọi thêm /api/users/me ở đây để lấy `user` thật)
        setUser({ username }); 
        setIsLoggedIn(true);
        
        // 3. Chuyển hướng đến trang app
        navigate('/app');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      alert('Sai tên đăng nhập hoặc mật khẩu!');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để dễ dàng sử dụng context
export const useAuth = () => {
  return useContext(AuthContext);
};