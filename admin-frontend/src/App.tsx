
import './App.css'
import "./lib/injectAuth"
import { Routing } from './routes'
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { clearAuthStorage } from './contexts/AuthContext';

// axiosのレスポンスインターセプターでグローバルエラーハンドリング
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      console.log('Unauthorized error detected, redirecting to login');
      clearAuthStorage();
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

function App() {

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Routing />
      </QueryClientProvider>
    </>
  )
}

export default App
