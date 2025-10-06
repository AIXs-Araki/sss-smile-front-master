import { BrowserRouter as Router, Outlet, Route, Routes } from 'react-router-dom';
import { MonitoringScreen } from './features/monitor/MonitoringScreen';
import { LoginScreen } from './features/login/LoginScreen';
import { Header } from './components/HeaderModern';
import { UserDetailModal } from './features/monitor/modals/UserDetailModal';
import { UsersScreen } from './features/management/users/UsersScreen';
import { StaffsScreen } from './features/management/staffs/StaffsScreen';
import { RoomsScreen } from './features/management/rooms/RoomsScreen';
import { ChangePasswordScreen } from './features/password/ChangePasswordScreen';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AlertScreen } from './features/alerts/AlertScreen';

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
            <Route path="/monitor/:groupId" element={<MonitoringScreen />}>
              <Route path="card/:cardId" element={<UserDetailModal />} />
            </Route>
            <Route path="/rooms" element={<RoomsScreen />} />
            <Route path="/staffs" element={<StaffsScreen />} />
            <Route path="/users" element={<UsersScreen />} />
            <Route path="/change-password" element={<ChangePasswordScreen />} />
            <Route path="/alerts" element={<AlertScreen />} />
            <Route path="/rooms" element={<RoomsScreen />} />
            <Route path="/staffs" element={<StaffsScreen />} />
            <Route path="/users" element={<UsersScreen />} />
            <Route path="/change-password" element={<ChangePasswordScreen />} />
          </Route>
        </Routes>

        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
};
