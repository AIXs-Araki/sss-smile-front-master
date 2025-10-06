// src/AudioContext.tsx
// オーディオ再生の状態管理、アンロック処理、PWA判定などを行うContext Provider
import { usePwaDisplayMode } from '@/hooks/usePwaDisplayMode';
import React, { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode, type PropsWithChildren } from 'react';

// Contextが提供する値の型定義
interface AudioContextType {
  requestPlay: () => void;
  releasePlay: () => void;
  unlockAudio: () => void;
  setSoundSrc: (src: string) => void;
  isAlertRequired: boolean;
}

const AudioContext = createContext<AudioContextType | null>(null);

// Providerコンポーネント
export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requesterCount, setRequesterCount] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [soundSrc, setSoundSrcInternal] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isPwa = usePwaDisplayMode();
  const isAudioPreferred = true; // ここでは簡略化のため常にtrue。本来はユーザー設定など。

  // アンロックが必要な状態かを判定
  const isAlertRequired = !!soundSrc && !isPwa && isAudioPreferred && !isUnlocked;

  useEffect(() => {
    // 既存のAudioオブジェクトがあれば停止させる
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // soundSrcがなければ、refをクリアして終了
    if (!soundSrc) {
      audioRef.current = null;
      return;
    }

    // 新しいAudioオブジェクトを生成
    const audio = new Audio(soundSrc);
    audio.loop = true;
    audioRef.current = audio;

    // クリーンアップ関数
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [soundSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    // 操作対象のAudioオブジェクトがなければ何もしない
    if (!audio) return;

    // 再生すべきかどうかの条件
    const shouldPlay = requesterCount > 0 && isUnlocked;

    if (shouldPlay) {
      // play()はPromiseを返すため、エラーハンドリングを行う
      audio.play().catch(e => {
        if (e.name !== 'NotAllowedError') {
          console.error("Audio play failed:", e);
        }
      });
    } else {
      audio.pause();
      // 再生要求が0になったら再生位置を最初に戻す
      if (requesterCount === 0) {
        audio.currentTime = 0;
      }
    }
  }, [requesterCount, isUnlocked]);

  // オーディオ再生の許可を得る
  const unlockAudio = useCallback(() => {
    if (isUnlocked) return;
    setIsUnlocked(true); // 即座にUIを更新するために先にセット
    console.log("Audio context has been unlocked by user interaction.");
  }, [isUnlocked]);

  // 再生要求
  const requestPlay = useCallback(() => {
    setRequesterCount(prevCount => {
      const newCount = prevCount + 1;
      if (newCount === 1 && audioRef.current && isUnlocked) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      return newCount;
    });
  }, [isUnlocked]);

  // 再生要求の解放
  const releasePlay = useCallback(() => {
    setRequesterCount(prevCount => {
      const newCount = Math.max(0, prevCount - 1);
      if (newCount === 0 && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return newCount;
    });
  }, []);

  // 再生する音声ソースを設定
  const setSoundSrc = useCallback((src: string) => {
    setSoundSrcInternal(src);
  }, []);

  const value = { requestPlay, releasePlay, unlockAudio, setSoundSrc, isAlertRequired };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

// Contextを簡単に利用するためのカスタムフック
export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const RequireAudio: React.FC<PropsWithChildren> = ({ children }) => {
  const { unlockAudio, isAlertRequired } = useAudio();

  return (
    <div onClick={unlockAudio}>
      {isAlertRequired && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          color: 'white', textAlign: 'center'
        }}>
          <div>
            <h2>音声アラートはロックされています</h2>
            <p>画面のどこかをクリックして有効化してください。</p>
          </div>
        </div>
      )}      {children}
    </div>
  );
};