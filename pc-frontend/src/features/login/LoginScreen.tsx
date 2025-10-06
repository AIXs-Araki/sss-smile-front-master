import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalStorageState } from 'ahooks';
import { type FormEvent, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLogin } from '@/query/useLogin';

export const LoginScreen = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [groupId,] = useLocalStorageState("defaultGroupId", { listenStorageChange: true });
  const { login, isAuthenticated } = useAuth();
  const loginMutation = useLogin();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/monitor/${groupId || 1}`);
    }
  }, [isAuthenticated, navigate, groupId]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setErrorMessage('ログインIDとパスワードを入力してください。');
      return;
    }
    setErrorMessage('');

    console.log('🔄 ログイン開始');
    const credentials = { data: { ID: loginId, PW: password } };
    const result = await loginMutation.mutateAsync(credentials);
    const isSuccess = (result.status === 200);
    const token = result.data?.AuthenticationResult?.AccessToken;

    if (isSuccess && token) {
      console.log('🚀 ログイン成功 - リダイレクト開始');
      // 環境変数からcidとfidを取得
      //      const { cid, fid } = getDefaultUserData();
      const cid = result.data.CorpID;
      const fid = result.data.FacilityID;
      const uid = result.data.UserID
      const facilityName = result.data.FacilityName;
      login(token, cid, fid, facilityName, uid);
      const targetPath = `/monitor/${groupId || 1}`;
      navigate(targetPath);
    } else {
      console.log('❌ ログイン失敗');
      setErrorMessage('ログインIDまたはパスワードが間違っています。');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="flex w-[350px] flex-col gap-5 rounded-lg border border-gray-300 bg-white p-10 shadow-md"
      >
        <img src="/hitsuji-logo.png" alt="Hitsuji Logo" />
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