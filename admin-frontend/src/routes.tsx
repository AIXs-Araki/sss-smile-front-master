import { BrowserRouter as Router, Outlet, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Toaster } from './components/ui/sonner';
import { LoginScreen } from './features/login/LoginScreen';
import { FacilityScreen } from './features/facility/FacilityScreen';
import { DeviceScreen } from './features/devices/DeviceScreen';
import { AlertScreen } from './features/alerts/AlertScreen';
import { CorporateScreen } from './features/corporate/CorporateScreen';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';


/**
 * ヘッダーを含むページのレイアウトコンポーネント
 */
const AppLayout = () => (
  <ProtectedRoute>
    <Header userName="山田　太郎" userEmail="yamada@example.com" appVersion="1.2.3" />
    <Outlet />
  </ProtectedRoute>
);

export const Routing = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ヘッダーが不要なルート */}
          <Route path="/" element={<LoginScreen />} />
          <Route path="/login" element={<LoginScreen />} />

          {/* ヘッダーが必要なルート */}
          <Route element={<AppLayout />}>
            <Route path="/corporate" element={<CorporateScreen />} />
            <Route path="/facility/new" element={<FacilityScreen isNew={true} />} />
            <Route path="/facility/:id" element={<FacilityScreen isNew={false} />} />
            <Route path="/devices" element={<DeviceScreen />} />
            <Route path="/alerts/:cid/:fid" element={<AlertScreen />} />

          </Route>
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
};
