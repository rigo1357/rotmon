// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [semester, setSemester] = useState('2023-2');
  const [department, setDepartment] = useState('');
  const [major, setMajor] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [manualCourse, setManualCourse] = useState({
    code: '',
    name: '',
    credits: '',
    department: '',
    major: '',
  });
  const [manualMessage, setManualMessage] = useState(null);

  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const response = await api.get('/api/courses', {
        params: { semester, major: major || undefined },
      });
      setCourses(response.data?.items || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách môn học. Vui lòng thử lại.');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [semester, major]);

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Vui lòng chọn file PDF/Excel/CSV');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('semester', semester);
    if (department) {
      formData.append('department', department);
    }
    if (major) {
      formData.append('major', major);
    }
    formData.append('file', selectedFile);

    try {
      const response = await api.post('/api/admin/upload-courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadInfo(response.data);
      setSelectedFile(null);
      await fetchCourses();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || err.message || 'Upload thất bại';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualCourse.code.trim() || !manualCourse.name.trim()) {
      setManualMessage({ type: 'error', text: 'Vui lòng nhập mã môn và tên môn.' });
      return;
    }
    const creditsValue = parseInt(manualCourse.credits || '0', 10);
    if (Number.isNaN(creditsValue) || creditsValue < 0) {
      setManualMessage({ type: 'error', text: 'Số tín chỉ phải là số không âm.' });
      return;
    }

    try {
      const payload = {
        code: manualCourse.code.trim().toUpperCase(),
        name: manualCourse.name.trim(),
        credits: creditsValue,
        semester: semester,
        department: manualCourse.department.trim() || department || null,
        major: manualCourse.major?.trim() || major || null,
        metadata: {},
      };
      const response = await api.post('/api/admin/courses', payload);
      setManualMessage({
        type: 'success',
        text: `Đã lưu môn ${response.data.code} - ${response.data.name}.`,
      });
      setManualCourse({ code: '', name: '', credits: '', department: '', major: '' });
      await fetchCourses();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.detail || err.message || 'Không thể thêm môn.';
      setManualMessage({ type: 'error', text: message });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e293b,#0b1120)', padding: '30px', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Bảng điều khiển quản trị</h1>
          <p style={{ marginTop: '5px', color: '#94a3b8' }}>Xin chào, {user?.username} (Admin)</p>
        </div>
        <div>
          <button
            onClick={() => navigate('/app')}
            style={{ marginRight: '10px', padding: '10px 18px', borderRadius: '6px', border: 'none', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ← Về trang xếp lịch
          </button>
          <button
            onClick={logout}
            style={{ padding: '10px 18px', borderRadius: '6px', border: 'none', backgroundColor: '#f87171', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        <section style={{ backgroundColor: 'rgba(15,23,42,0.85)', borderRadius: '16px', padding: '25px', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
          <h2 style={{ marginTop: 0 }}>1. Upload danh sách môn học</h2>
          <p style={{ color: '#94a3b8' }}>
            Chấp nhận định dạng: <strong>PDF, XLS, XLSX, CSV</strong>. Vui lòng đảm bảo file có cột <em>Mã môn</em>, <em>Tên môn</em>, <em>Tín chỉ</em>.
            {' '}Tải file CSV mẫu tại{' '}
            <a href="/samples/courses_sample.csv" style={{ color: '#38bdf8' }} download>
              đây
            </a>.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label>Chuyên ngành (Tuỳ chọn)</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="VD: KTPM"
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0' }}
              />
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <label>Học kỳ *</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0' }}
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label>Bộ môn / Khoa (Tuỳ chọn)</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="VD: CNTT"
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0' }}
              />
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <label>Tệp môn học *</label>
              <input
                type="file"
                accept=".csv,.xls,.xlsx,.pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0' }}
              />
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            style={{
              marginTop: '20px',
              padding: '12px 28px',
              borderRadius: '999px',
              border: 'none',
              background: isUploading ? '#475569' : 'linear-gradient(135deg,#38bdf8,#22d3ee)',
              color: '#0f172a',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              cursor: isUploading ? 'not-allowed' : 'pointer'
            }}
          >
            {isUploading ? 'Đang upload...' : 'Tải lên & ghi đè học kỳ'}
          </button>

          {uploadInfo && (
            <div style={{ marginTop: '20px', padding: '15px', borderRadius: '12px', backgroundColor: '#0f1f2f' }}>
              <p style={{ margin: 0 }}>✅ Đã import <strong>{uploadInfo.inserted}</strong> môn học cho học kỳ <strong>{uploadInfo.semester}</strong>.</p>
              {uploadInfo.sample?.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ marginBottom: '5px', color: '#94a3b8' }}>Một vài môn mẫu:</p>
                  <ul>
                    {uploadInfo.sample.map((course) => (
                      <li key={course.code}>{course.code} - {course.name} ({course.credits} tín chỉ)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        <section style={{ backgroundColor: 'rgba(15,23,42,0.85)', borderRadius: '16px', padding: '25px', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
          <h2 style={{ marginTop: 0 }}>2. Thêm nhanh 1 môn học</h2>
          <p style={{ color: '#94a3b8', marginBottom: '15px' }}>Dùng khi cần bổ sung lẻ tẻ mà không cần upload lại toàn bộ file.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '15px' }}>
            <div>
              <label>Mã môn *</label>
              <input
                type="text"
                value={manualCourse.code}
                onChange={(e) => setManualCourse({ ...manualCourse, code: e.target.value })}
                placeholder="VD: INT2201"
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0' }}
              />
            </div>
            <div>
              <label>Tên môn *</label>
              <input
                type="text"
                value={manualCourse.name}
                onChange={(e) => setManualCourse({ ...manualCourse, name: e.target.value })}
                placeholder="VD: Cấu trúc dữ liệu"
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0' }}
              />
            </div>
            <div>
              <label>Tín chỉ</label>
              <input
                type="number"
                min="0"
                value={manualCourse.credits}
                onChange={(e) => setManualCourse({ ...manualCourse, credits: e.target.value })}
                placeholder="VD: 3"
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0' }}
              />
            </div>
            <div>
              <label>Bộ môn (tuỳ chọn)</label>
              <input
                type="text"
                value={manualCourse.department}
                onChange={(e) => setManualCourse({ ...manualCourse, department: e.target.value })}
                placeholder="VD: Khoa CNTT"
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0' }}
              />
            </div>
            <div>
              <label>Chuyên ngành (tuỳ chọn)</label>
              <input
                type="text"
                value={manualCourse.major}
                onChange={(e) => setManualCourse({ ...manualCourse, major: e.target.value })}
                placeholder="VD: Kỹ thuật phần mềm"
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0' }}
              />
            </div>
          </div>
          <button
            onClick={handleManualSubmit}
            style={{
              marginTop: '18px',
              padding: '12px 24px',
              borderRadius: '999px',
              border: 'none',
              background: 'linear-gradient(135deg,#34d399,#10b981)',
              color: '#0f172a',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Thêm / cập nhật môn
          </button>
          {manualMessage && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: manualMessage.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(248,113,113,0.15)',
                border: manualMessage.type === 'success' ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(248,113,113,0.4)',
                color: manualMessage.type === 'success' ? '#bbf7d0' : '#fecaca',
              }}
            >
              {manualMessage.text}
            </div>
          )}
        </section>

        <section style={{ backgroundColor: 'rgba(15,23,42,0.85)', borderRadius: '16px', padding: '25px', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ marginTop: 0 }}>3. Môn học trong học kỳ {semester}</h2>
              <p style={{ color: '#94a3b8' }}>Danh sách này sẽ xuất hiện cho sinh viên khi chọn môn.</p>
            </div>
            <button
              onClick={fetchCourses}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#38bdf8', cursor: 'pointer' }}
            >
              Làm mới
            </button>
          </div>

          {error && <p style={{ color: '#f87171' }}>{error}</p>}
          {isLoadingCourses ? (
            <p>Đang tải danh sách môn học...</p>
          ) : (
            <div style={{ maxHeight: '360px', overflowY: 'auto', borderRadius: '12px', border: '1px solid #1f2937' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#1e293b' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Mã môn</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Tên môn</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Tín chỉ</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Bộ môn</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Chưa có môn học nào cho học kỳ này.</td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={`${course.code}-${course.name}`} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '12px' }}>{course.code}</td>
                        <td style={{ padding: '12px' }}>{course.name}</td>
                        <td style={{ padding: '12px' }}>{course.credits}</td>
                        <td style={{ padding: '12px' }}>{course.department || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminPage;

