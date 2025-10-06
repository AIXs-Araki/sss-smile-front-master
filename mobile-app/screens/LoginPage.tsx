import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { useAuthCode } from './query';
import CodeInputPage from './CodeInputPage';
import Constants from 'expo-constants';

export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const passwordInputRef = useRef<TextInput>(null);
  const requestAuth = useAuthCode();

  const handleLogin = async () => {
    Keyboard.dismiss();
    setErrorMessage('');

    if (!loginId || !password) {
      setErrorMessage('ログインIDとパスワードを入力してください。');
      return;
    }

    try {
      const response = await requestAuth.mutateAsync({ data: { ID: loginId, PW: password } });
      if (response.status === 200) {
        setShowCodeInput(true);
      }
    } catch (error) {
      setErrorMessage('ログインIDまたはパスワードが間違っています。');
    }
  };



  if (showCodeInput) {
    return (
      <CodeInputPage
        loginId={loginId}
        password={password}
        onBack={() => setShowCodeInput(false)}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-white px-6">
          <View className="w-full max-w-md items-center">
            <Image
              source={require('../assets/hitsuji-logo.png')}
              resizeMode="contain"
              style={{ width: 220, marginBottom: 10 }}
            />

            <View className="w-full px-4">
              <View className="w-full mb-5">
                <Text className="text-xl font-semibold text-slate-700 mb-2">ログインID</Text>
                <TextInput
                  className="h-14 w-full bg-white border border-slate-300 rounded-xl px-4 text-lg focus:border-blue-500"
                  placeholder="メールアドレス"
                  value={loginId}
                  onChangeText={setLoginId}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>

              <View className="mb-8 w-full">
                <Text className="text-base font-semibold text-slate-700 mb-2">パスワード</Text>
                <TextInput
                  ref={passwordInputRef}
                  className="h-14 w-full bg-white border border-slate-300 rounded-xl px-4 text-lg focus:border-blue-500"
                  placeholder="パスワードを入力"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                {errorMessage ? (
                  <Text className="text-red-500 text-sm mt-2">{Constants.expoConfig?.extra?.apiBaseUrl}{errorMessage}</Text>
                ) : null}
              </View>

              <View className="items-center pb-16">
                <TouchableOpacity
                  onPress={handleLogin}
                  className="h-14 w-full max-w-xs bg-blue-500 rounded-xl flex-row justify-center items-center shadow-lg shadow-blue-500/30 active:bg-blue-600"
                >
                  <Text className="text-white text-xl font-bold px-8">ログイン</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
