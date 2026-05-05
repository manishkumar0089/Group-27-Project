import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import EventsPage from './pages/admin/EventsPage';
import CreateEventPage from './pages/admin/CreateEventPage';
import EventAnalytics from './pages/admin/EventAnalytics';
import VolunteerManagement from './pages/admin/VolunteerManagement';

// Volunteer
import ScannerPage from './pages/volunteer/ScannerPage';
import ManualSearchPage from './pages/volunteer/ManualSearchPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main>{children}</main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['STUDENT']}>
              <AppLayout><StudentDashboard /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AppLayout><AdminDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AppLayout><EventsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/events/create" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AppLayout><CreateEventPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/events/:id/analytics" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AppLayout><EventAnalytics /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/volunteers" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AppLayout><VolunteerManagement /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Volunteer */}
          <Route path="/volunteer/scan" element={
            <ProtectedRoute roles={['VOLUNTEER', 'ADMIN']}>
              <ScannerPage />
            </ProtectedRoute>
          } />
          <Route path="/volunteer/search" element={
            <ProtectedRoute roles={['VOLUNTEER', 'ADMIN']}>
              <AppLayout><ManualSearchPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
