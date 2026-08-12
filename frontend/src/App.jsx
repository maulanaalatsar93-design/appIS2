import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { UploadProvider } from './context/UploadContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import PublicDashboard from './pages/PublicDashboard';
import InternalDashboard from './pages/InternalDashboard';
import ImportData from './pages/ImportData';
import WorkOrderList from './pages/WorkOrderList';
import RekomendasiList from './pages/RekomendasiList';
import ManPowerPage from './pages/ManPowerPage';
import ManpowerPlanning from './pages/ManpowerPlanning';
import ManpowerAvailabilityBoard from './pages/ManpowerAvailabilityBoard';
import WorkProgramList from './pages/WorkProgramList';
import WorkCube from './pages/WorkCube';
import WPEMMonitor from './pages/WPEMMonitor';
import SertifikasiPersonel from './pages/SertifikasiPersonel';
import PdmScheduleRules from './pages/pdm/PdmScheduleRules';
import PdmTaskBoard from './pages/pdm/PdmTaskBoard';
import PdmCalendar from './pages/pdm/PdmCalendar';
import PdmDashboard from './pages/pdm/PdmDashboard';
import PdmRoster from './pages/pdm/PdmRoster';
import { Loader2 } from 'lucide-react';

// A simple protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-industrial-background">
        <Loader2 className="w-8 h-8 animate-spin text-industrial-blue" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function MainApp() {
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('activeTab') || 'dashboard');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    sessionStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const renderDashboard = () => {
    if (user) {
      return <InternalDashboard />;
    }
    return <PublicDashboard />;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Root Route (Public or Internal Dashboard) */}
      <Route
        path="/"
        element={
          <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === 'dashboard' ? (
              renderDashboard()
            ) : activeTab === 'import' ? (
              <ProtectedRoute>
                <ImportData />
              </ProtectedRoute>
            ) : activeTab === 'workorders' ? (
              <ProtectedRoute>
                <WorkOrderList />
              </ProtectedRoute>
            ) : activeTab === 'recommendations' ? (
              <ProtectedRoute>
                <RekomendasiList />
              </ProtectedRoute>
            ) : activeTab === 'manpower' ? (
              <ProtectedRoute>
                <ManPowerPage />
              </ProtectedRoute>
            ) : activeTab === 'sertifikasi' ? (
              <ProtectedRoute>
                <SertifikasiPersonel />
              </ProtectedRoute>
            ) : activeTab === 'manpower-plan' ? (
              <ProtectedRoute>
                <ManpowerPlanning />
              </ProtectedRoute>
            ) : activeTab === 'wp-availability' ? (
              <ProtectedRoute>
                <ManpowerAvailabilityBoard />
              </ProtectedRoute>
            ) : activeTab === 'wp-programs' ? (
              <ProtectedRoute>
                <WorkProgramList />
              </ProtectedRoute>
            ) : activeTab === 'wp-my-cube' ? (
              <ProtectedRoute>
                <WorkCube />
              </ProtectedRoute>
            ) : activeTab === 'wp-monitor' ? (
              <ProtectedRoute>
                <WPEMMonitor />
              </ProtectedRoute>
            ) : activeTab === 'pdm-dashboard' ? (
              <ProtectedRoute>
                <PdmDashboard />
              </ProtectedRoute>
            ) : activeTab === 'pdm-calendar' ? (
              <ProtectedRoute>
                <PdmCalendar />
              </ProtectedRoute>
            ) : activeTab === 'pdm-tasks' ? (
              <ProtectedRoute>
                <PdmTaskBoard />
              </ProtectedRoute>
            ) : activeTab === 'pdm-roster' ? (
              <ProtectedRoute>
                <PdmRoster />
              </ProtectedRoute>
            ) : activeTab === 'pdm-rules' ? (
              <ProtectedRoute>
                <PdmScheduleRules />
              </ProtectedRoute>
            ) : (
              <ProtectedRoute>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-industrial-text capitalize">
                    {activeTab.replace('-', ' ')}
                  </h2>
                  <p className="text-sm text-industrial-muted mt-2">
                    Konten untuk modul ini akan dibangun pada task selanjutnya.
                  </p>
                </div>
              </ProtectedRoute>
            )}
          </MainLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UploadProvider>
          <MainApp />
        </UploadProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
