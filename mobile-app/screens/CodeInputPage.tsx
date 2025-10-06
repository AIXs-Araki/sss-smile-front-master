import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLogin } from './query';

interface CodeInputPageProps {
  loginId: string;
  password: string;
  onBack: () => void;
}

export default function CodeInputPage({ loginId, password, onBack }: CodeInputPageProps) {
  const { login } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const codeInputRefs = useRef<(TextInput | null)[]>([]);
  const doLogin = useLogin();

  const handleCodeChange = useCallback((value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleCodeSubmit(newCode.join(''));
    }
  }, [code]);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === 'Backspace' && code[index] === '' && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      codeInputRefs.current[index - 1]?.focus();
    }
  }, [code]);

  const handleCodeSubmit = async (sixDigitCode: string) => {
    try {
      const response = await doLogin.mutateAsync({
        data: { ID: loginId, PW: password, OneTimePassCode: sixDigitCode }
      });

      const token = response.data?.AuthenticationResult?.AccessToken;
      const cid = response.data?.CorpID;
      const fid = response.data?.FacilityID;
      const facilityName = response.data?.FacilityName;

      await login(token!, cid, fid, facilityName);
    } catch (error) {
      Alert.alert('エラー', 'ログインに失敗しました。');
      setCode(['', '', '', '', '', '']);
      codeInputRefs.current[0]?.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-white px-6">
          <View className="w-full max-w-md items-center">
            <Text className="text-2xl font-bold text-slate-700 mb-8">認証コード入力</Text>
            <Text className="text-lg font-semibold text-slate-700 mb-6 text-center">
              メールに送信された6桁のコードを入力してください
            </Text>
            <View className="flex flex-row justify-center space-x-2 mb-8">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                  key={`code-input-${index}`}
                  ref={(ref) => (codeInputRefs.current[index] = ref)}
                  className="w-12 h-14 bg-white border border-slate-300 rounded-xl text-center text-xl font-bold focus:border-blue-500"
                  value={code[index]}
                  onChangeText={(value) => handleCodeChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </View>
            <TouchableOpacity onPress={onBack} className="mt-4">
              <Text className="text-blue-500 text-base">戻る</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}