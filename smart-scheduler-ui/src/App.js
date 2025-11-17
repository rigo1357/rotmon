// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import SchedulerPage from './pages/SchedulerPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage />} />
      
      {/* Đây là trang được bảo vệ */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <SchedulerPage />
          </ProtectedRoute>
        }
      />
      
      {/* Thêm các route khác nếu cần */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;