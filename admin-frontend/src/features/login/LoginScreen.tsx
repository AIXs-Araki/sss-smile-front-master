import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { type FormEvent, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from './query';

export const LoginScreen = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const loginMutation = useLogin();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/corporate');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setErrorMessage('ログインIDとパスワードを入力してください。');
      return;
    }
    setErrorMessage('');

    try {
      const result = await loginMutation.mutateAsync({
        data: {
          ID: loginId,
          PW: password,
          EmployeeNumber: ''
        }
      });

      const isSuccess = result.status === 200;
      const token = result.data?.AuthenticationResult?.AccessToken;

      if (isSuccess && token) {
        login(token);
        navigate('/corporate');
      } else {
        setErrorMessage('ログインIDまたはパスワードが間違っています。');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('ログインIDまたはパスワードが間違っています。');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="flex w-[350px] flex-col gap-5 rounded-lg border border-gray-300 bg-white p-10 shadow-md"
      >
        <div className="flex flex-col gap-2 items-center justify-center">
          <img src="/hitsuji-logo.png" alt="Hitsuji Logo" />
          <div className="font-semibold">
            システム管理アプリ
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="loginId">ログインID</label>
          <Input
            id="loginId"
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password">パスワード</label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {errorMessage && (
          <p className="text-center text-sm text-red-500">{errorMessage}</p>
        )}
        <Button variant="default" type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'ログイン中...' : 'ログイン'}
        </Button>
      </form>
    </div>
  );
};