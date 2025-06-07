import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ManualEntryPage from './pages/ManualEntryPage';
import ClippingPage from './pages/ClippingPage';
import Navbar from './Navbar';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import DownloadsPage from './pages/DownloadsPage';
import AuditLogPage from './pages/AuditLogPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
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
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
