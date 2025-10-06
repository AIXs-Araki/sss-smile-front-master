import { useLayoutEffect, useState } from "react";

export const useResponsiveValue = <T extends HTMLElement>(
  node: T | null,
  calculateValue: (size: { width: number, height: number }) => number
): number => {
  const [value, setValue] = useState<number>(0);

  useLayoutEffect(() => {
    if (!node) {
      return;
    }

    const updateValue = (width: number, height: number) => {
      const newValue = calculateValue({ width, height });
      setValue(newValue);
    };

    const observer = new ResizeObserver(entries => {
      if (entries && entries[0]) {
        // requestAnimationFrame を挟むことで、リサイズループのエラーを防ぐ
        window.requestAnimationFrame(() => {
          const newWidth = entries[0].contentRect.width;
          const newHeight = entries[0].contentRect.height;
          updateValue(newWidth, newHeight);
        });
      }
    });

    observer.observe(node);
    // 初回の値を設定
    updateValue(node.clientWidth, node.clientHeight);

    // クリーンアップ関数
    return () => {
      observer.disconnect();
    };
  }, [node, calculateValue]);
  return value;
};
