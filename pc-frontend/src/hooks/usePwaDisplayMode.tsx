// src/hooks/usePwaDisplayMode.ts
// アプリがPWAとして(standalone)で実行されているかを判定するフック
import { useState, useEffect } from 'react';

export const usePwaDisplayMode = (): boolean => {
  const [isPwa, setIsPwa] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone) or (display-mode: minimal-ui)');
    setIsPwa(mediaQuery.matches);
  }, []);

  return isPwa;
};