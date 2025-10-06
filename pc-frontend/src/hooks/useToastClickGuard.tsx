import { useEffect } from 'react';

/**
 * モーダル表示中に背景のToastがクリックされてもモーダルが閉じないようにするフック
 * @param isOpen - モーダルが開いているかどうかを示すboolean値
 */
export const useToastClickGuard = (isOpen: boolean) => {
  useEffect(() => {
    // モーダルが閉じていれば何もしない
    if (!isOpen) {
      return;
    }

    // pointerdownイベントを監視するハンドラ
    const handlePointerDown = (e: PointerEvent) => {
      // クリックされた要素がToastコンテナ（またはその中身）であれば、イベントの伝播を止める
      if ((e.target as HTMLElement).closest('[data-sonner-toaster]')) {
        e.stopPropagation();
      }
    };

    // イベントリスナーをキャプチャフェーズで登録
    window.addEventListener('pointerdown', handlePointerDown, { capture: true });

    // クリーンアップ関数
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
    };
  }, [isOpen]); // isOpenが変更された時のみeffectを再実行
};