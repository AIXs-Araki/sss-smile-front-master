import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { eventHub } from '../lib/eventHub';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  cid: number | null;
  fid: string | null;
  facilityName: string | null;
  uid: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, cid?: number, fid?: string, facilityName?: string, uid?: string) => void;
  logout: () => void;
  gotoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const CID_KEY = 'auth_cid';
const FID_KEY = 'auth_fid';
const FACILITY_NAME_KEY = 'auth_facility_name';
const UID_KEY = 'auth_uid';

export const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CID_KEY);
  localStorage.removeItem(FID_KEY);
  localStorage.removeItem(FACILITY_NAME_KEY);
  localStorage.removeItem(UID_KEY);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: localStorage.getItem(TOKEN_KEY),
    isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
    cid: localStorage.getItem(CID_KEY) ? Number(localStorage.getItem(CID_KEY)) : null,
    fid: localStorage.getItem(FID_KEY),
    facilityName: localStorage.getItem(FACILITY_NAME_KEY),
    uid: localStorage.getItem(UID_KEY),
  });

  const navigate = useNavigate();
  const location = useLocation();

  const login = useCallback((token: string, cid?: number, fid?: string, facilityName?: string, uid?: string) => {
    console.log('🔐 AuthContext.login 呼び出し:', token, cid, fid, facilityName, uid);
    localStorage.setItem(TOKEN_KEY, token);
    if (cid !== undefined) {
      localStorage.setItem(CID_KEY, cid.toString());
    }
    if (fid !== undefined) {
      localStorage.setItem(FID_KEY, fid);
    }
    if (facilityName !== undefined) {
      localStorage.setItem(FACILITY_NAME_KEY, facilityName);
    }
    if (uid !== undefined) {
      localStorage.setItem(UID_KEY, uid);
    }
    setAuthState({
      token,
      isAuthenticated: true,
      cid: cid ?? authState.cid,
      fid: fid ?? authState.fid,
      facilityName: facilityName ?? authState.facilityName,
      uid: uid ?? authState.uid
    });
    console.log('✅ 認証状態更新完了');
  }, [authState.cid, authState.fid, authState.facilityName, authState.uid]);

  const logout = useCallback(() => {
    clearAuthStorage();
    setAuthState({ token: null, isAuthenticated: false, cid: null, fid: null, facilityName: null, uid: null });
    navigate('/login');
  }, [navigate]);

  const gotoLogin = useCallback(() => {
    if (location.pathname !== '/login' && location.pathname !== '/') {
      navigate('/login');
    }
  }, [location.pathname, navigate]);

  // トークンの有効性チェック（簡易版）
  useEffect(() => {
    if (authState.token && location.pathname !== '/login' && location.pathname !== '/') {
      // 実際のアプリではトークンの有効期限をチェック
      // 今回は簡易実装のため省略
    }
  }, [authState.token, location.pathname]);

  // TokenExpiredイベントのリスナー
  useEffect(() => {
    const unsubscribe = eventHub.subscribe('TokenExpired', () => {
      logout();
    });
    return () => { unsubscribe() };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, gotoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
