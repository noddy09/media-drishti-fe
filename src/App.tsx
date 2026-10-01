import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
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
import { finishInitialization, login } from './slices/authSlice';
import Cookies from 'js-cookie';

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isInitialized = useSelector((state: RootState) => state.auth.isInitialized);
  const location = useLocation();

  if (!isInitialized) return null;
  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location }} />;
};

const LoginRoute: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isInitialized = useSelector((state: RootState) => state.auth.isInitialized);
  const location = useLocation();
  const from = (location.state as {
    from?: { pathname: string; search: string; hash: string };
  } | null)?.from;

  if (!isInitialized) return null;
  return isAuthenticated
    ? <Navigate to={from ? { pathname: from.pathname, search: from.search, hash: from.hash } : '/dashboard'} replace />
    : <LoginPage />;
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
          return;
        }
      } catch {}
      Cookies.remove('access');
      Cookies.remove('refresh');
    }
    dispatch(finishInitialization());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
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
