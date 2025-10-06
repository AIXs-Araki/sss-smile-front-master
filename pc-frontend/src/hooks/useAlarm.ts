// src/useAlarm.ts
// コンポーネントのアラート状態に応じて再生要求/解放を行うカスタムフック
import { useAudio } from '@/components/AudioContext';
import { useEffect } from 'react';

export const useAlarm = (isAlerting: boolean) => {
  const { requestPlay, releasePlay } = useAudio();

  useEffect(() => {
    if (isAlerting) {
      console.log("play!")
      requestPlay();
      return () => {
        console.log("stop!")
        releasePlay();
      };
    }
  }, [isAlerting, requestPlay, releasePlay]);
};