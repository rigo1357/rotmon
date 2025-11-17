// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Chào mừng đến với Smart Scheduler</h1>
      <p>Giải pháp xếp lịch học thông minh bằng AI và Giải thuật Di truyền.</p>
      <Link to="/login">
        <button style={{ padding: '10px 20px', fontSize: '16px' }}>
          Đăng nhập để bắt đầu
        </button>
      </Link>
    </div>
  );
}

export default HomePage;