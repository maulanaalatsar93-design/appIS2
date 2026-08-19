import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { UploadProvider } from './context/UploadContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import PublicDashboard from './pages/PublicDashboard';
import InternalDashboard from './pages/InternalDashboard';
import ImportData from './pages/ImportData';
import ManPowerPage from './pages/ManPowerPage';
import WorkProgramList from './pages/WorkProgramList';
import WorkCube from './pages/WorkCube';
import WPEMMonitor from './pages/WPEMMonitor';
import SertifikasiPersonel from './pages/SertifikasiPersonel';
import PdmScheduleRules from './pages/pdm/PdmScheduleRules';
import PdmTaskBoard from './pages/pdm/PdmTaskBoard';
import PdmCalendar from './pages/pdm/PdmCalendar';
import PdmDashboard from './pages/pdm/PdmDashboard';
import PdmRoster from './pages/pdm/PdmRoster';
import PdmAreaDashboard from './pages/pdm/PdmAreaDashboard';
import ManHoursPage from './pages/ManHoursPage';
import PerformanceKillerPage from './pages/PerformanceKillerPage';
import FieldTaskPage from './pages/FieldTaskPage';
import { Loader2 } from 'lucide-react';

// Route guard: redirect ke /login jika belum login
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-industrial-background">
        <Loader2 className="w-8 h-8 animate-spin text-industrial-blue" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Route hanya untuk tamu — redirect ke / jika sudah login
const GuestRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-industrial-background">
        <Loader2 className="w-8 h-8 animate-spin text-industrial-blue" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return children;
};

// Dashboard root: public kalau belum login, internal kalau sudah
const DashboardRoot = () => {
  const { user } = useContext(AuthContext);
  return user ? <InternalDashboard /> : <PublicDashboard />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UploadProvider>
          <Routes>
            {/* ── Login (tamu saja) ── */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

            {/* ── Layout utama dengan Outlet ── */}
            <Route element={<MainLayout />}>
              {/* Dashboard root — public/internal otomatis */}
              <Route index element={<DashboardRoot />} />

              {/* ── Menu Utama ── */}
              <Route path="manpower"   element={<ProtectedRoute><ManPowerPage /></ProtectedRoute>} />
              <Route path="sertifikasi" element={<ProtectedRoute><SertifikasiPersonel /></ProtectedRoute>} />

              {/* ── PdM Rotating ── */}
              <Route path="pdm"              element={<ProtectedRoute><PdmDashboard /></ProtectedRoute>} />
              <Route path="pdm/area"         element={<ProtectedRoute><PdmAreaDashboard /></ProtectedRoute>} />
              <Route path="pdm/calendar"     element={<ProtectedRoute><PdmCalendar /></ProtectedRoute>} />
              <Route path="pdm/roster"       element={<ProtectedRoute><PdmRoster /></ProtectedRoute>} />
              <Route path="pdm/tasks"        element={<ProtectedRoute><PdmTaskBoard /></ProtectedRoute>} />
              <Route path="pdm/man-hours"    element={<ProtectedRoute><ManHoursPage /></ProtectedRoute>} />
              <Route path="pdm/field-tasks"  element={<ProtectedRoute><FieldTaskPage /></ProtectedRoute>} />
              <Route path="pdm/rules"        element={<ProtectedRoute><PdmScheduleRules /></ProtectedRoute>} />

              {/* ── Workforce Management ── */}
              <Route path="wp/programs"  element={<ProtectedRoute><WorkProgramList /></ProtectedRoute>} />
              <Route path="wp/cube"      element={<ProtectedRoute><WorkCube /></ProtectedRoute>} />
              <Route path="wp/monitor"   element={<ProtectedRoute><WPEMMonitor /></ProtectedRoute>} />

              {/* ── Import Data ── */}
              <Route path="import" element={<ProtectedRoute><ImportData /></ProtectedRoute>} />

              {/* ── Performance Killer ── */}
              <Route path="performance-killer" element={<ProtectedRoute><PerformanceKillerPage /></ProtectedRoute>} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </UploadProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
