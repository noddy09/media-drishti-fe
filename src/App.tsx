import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ManualEntryPage from './pages/ManualEntryPage';
import ClippingPage from './pages/ClippingPage';
import Navbar from './Navbar';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import DownloadsPage from './pages/DownloadsPage';
import AuditLogPage from './pages/AuditLogPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import TagManagementPage from './pages/TagManagementPage';
import { login } from './slices/authSlice';
import Cookies from 'js-cookie';

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const token = Cookies.get('access');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        if (payload.exp > currentTime) {
          dispatch(login({ username: payload.username, role: payload.role, accessToken: token }));
        } else {
          // Token expired
          Cookies.remove('access');
          Cookies.remove('refresh');
        }
      } catch (e) {
        // Invalid token
        Cookies.remove('access');
        Cookies.remove('refresh');
      }
    }
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/manual-entry" element={<ManualEntryPage />} />
          <Route path="/clipping" element={<ClippingPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/auditlog" element={<AuditLogPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/user-management" element={<UserManagementPage />} />
          <Route path="/tag-management" element={<TagManagementPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
