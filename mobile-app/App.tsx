import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './contexts/AuthContext';
import { PushNotificationProvider } from './contexts/PushNotificationContext';
import "./global.css";
import { AppContent } from './routes';
import { useNativationBarWhite } from './hooks/useNavigationBarWhite';

// axiosのレスポンスインターセプターでグローバルエラーハンドリング
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      console.log('Unauthorized error detected, redirecting to login');
      document.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      //      cacheTime: 5 * 60 * 1000,
      staleTime: 0,
      refetchOnWindowFocus: false,
      refetchInterval: 10000000,
      refetchIntervalInBackground: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: 0,
      gcTime: 5 * 60 * 1000,

    },
  },
});


export default function App() {
  useNativationBarWhite()

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PushNotificationProvider>
            <AppContent />
          </PushNotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}