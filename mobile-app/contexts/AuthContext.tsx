import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventHub } from '@core/helpers/eventHub';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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

export const clearAuthStorage = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, CID_KEY, FID_KEY, FACILITY_NAME_KEY, UID_KEY]);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
    isLoading: true,
    cid: null,
    fid: null,
    facilityName: null,
    uid: null,
  });

  // Load stored auth data on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const cid = await AsyncStorage.getItem(CID_KEY);
        const fid = await AsyncStorage.getItem(FID_KEY);
        const facilityName = await AsyncStorage.getItem(FACILITY_NAME_KEY);
        const uid = await AsyncStorage.getItem(UID_KEY);

        setAuthState({
          token,
          isAuthenticated: !!token,
          isLoading: false,
          cid: cid ? Number(cid) : null,
          fid,
          facilityName,
          uid,
        });
      } catch (error) {
        console.error('Failed to load auth data:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
    loadStoredAuth();
  }, []);


  const login = useCallback(async (token: string, cid?: number, fid?: string, facilityName?: string, uid?: string) => {
    console.log('🔐 AuthContext.login 呼び出し:', token, cid, fid, facilityName, uid);
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      if (cid !== undefined) {
        await AsyncStorage.setItem(CID_KEY, cid.toString());
      }
      if (fid !== undefined) {
        await AsyncStorage.setItem(FID_KEY, fid);
      }
      if (facilityName !== undefined) {
        await AsyncStorage.setItem(FACILITY_NAME_KEY, facilityName);
      }
      if (uid !== undefined) {
        await AsyncStorage.setItem(UID_KEY, uid);
      }
      setAuthState({
        token,
        isAuthenticated: true,
        isLoading: false,
        cid: cid ?? authState.cid,
        fid: fid ?? authState.fid,
        facilityName: facilityName ?? authState.facilityName,
        uid: uid ?? authState.uid
      });
      console.log('✅ 認証状態更新完了');
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }, [authState.cid, authState.fid, authState.facilityName, authState.uid]);

  const logout = useCallback(async () => {
    try {
      await clearAuthStorage();
      setAuthState({ token: null, isAuthenticated: false, isLoading: false, cid: null, fid: null, facilityName: null, uid: null });
      // go back to login screen
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }, []);

  const gotoLogin = useCallback(() => {
    // go back to login screen
  }, []);

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


