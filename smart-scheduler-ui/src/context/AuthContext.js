// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Import api đã cấu hình

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('access_token'));
  const navigate = useNavigate();

  const logout = (options = { redirect: true }) => {
    localStorage.removeItem('access_token');
    setUser(null);
    setIsLoggedIn(false);
    if (options.redirect) {
      navigate('/login');
    }
  };

  const fetchCurrentUser = async ({ logoutOnError = true } = {}) => {
    try {
      const response = await api.get('/api/users/me');
      setUser(response.data);
      setIsLoggedIn(true);
      return response.data;
    } catch (error) {
      console.error('Không thể lấy thông tin người dùng:', error);
      if (logoutOnError) {
        logout();
      }
      throw error;
    }
  };

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
        localStorage.setItem('access_token', response.data.access_token);
        try {
          const profile = await fetchCurrentUser({ logoutOnError: false });
          if (profile?.is_admin) {
            navigate('/admin');
          } else {
            navigate('/app');
          }
        } catch (error) {
          console.warn('Không thể lấy thông tin người dùng ngay sau đăng nhập, dùng thông tin tạm thời.', error);
          setUser({ username, is_admin: false });
          setIsLoggedIn(true);
          navigate('/app');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.message 
        || error.message 
        || 'Sai tên đăng nhập hoặc mật khẩu!';
      alert(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      fetchCurrentUser().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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