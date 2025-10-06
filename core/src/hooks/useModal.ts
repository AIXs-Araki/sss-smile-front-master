import { type ReactNode, useCallback, useMemo, useState } from "react";
import { rand52 } from "../helpers/numbers";
/**
 * モーダルの表示非表示を切り替える状態管理のための hook
 * モーダルは開く、閉じるというアクションがあるが、モーダルを閉じたとしても中の情報は自動的にはリセットされない。
 * そのためセッションという概念を用意して、新しいセッションIDが渡されたらモーダルは中の状態をリセットするという実装にする。
 * その状態と操作をまとめた hooks
 * sessionId はモーダルの key 属性として使うことで sesionId が変更されるたびに新しいコンポーネントインスタンスが作られることを保証する
 * sessionId は52bitsの乱数をセットする
 * type parameter T はmodal に渡したい入力の型
 * @param initialOpened
 */
export function useModal<T = undefined>(): ModalSession<T> {
  const [opened, setOpened] = useState(false);
  const randomSessionPrefix = useMemo(() => { return Math.random().toString() }, [])
  const [sessionId, setSessionId] = useState(0);
  const [input, setInput] = useState<T | undefined>(undefined);
  const open = useCallback((newInput?: T) => {
    setInput(newInput);
    setOpened(true);
  }, []);

  const close = useCallback(() => {
    setOpened(false);
    // アニメーションが終わってからセッションを増加させる
    setTimeout(() => {
      setInput(undefined);
      setSessionId(rand52());
    }, 250);
  }, []);

  return {
    opened,
    sessionId,
    open, close,
    setOpened,
    input,
    key: `${randomSessionPrefix}_${sessionId}`,
    props: {
      open: opened,
      close: close,
      ...input
    }
  }
}
type ModalSession<T> = {
  opened: boolean;
  sessionId: number;
  /**
   * 新しいセッションでモーダルを開く
   */
  open: (input?: T) => void;
  /**
   * モーダルを閉じてセッションをクリアする
   */
  close: () => void;
  /**
   * セッションをリセットせずに状態を維持したまま表示切り替えをする場合に使う関数
   */
  setOpened: (opened: boolean) => void;

  input: T | undefined;
  key: string;

  /**
   * Modalコンポーネントの props にそのまま渡せるデータ
   */
  props: {
    open: boolean,
    close: () => void
  }
}

export type OpenModal = (input: { type: "completed" | "error"; message: string | null | ReactNode; }) => void
