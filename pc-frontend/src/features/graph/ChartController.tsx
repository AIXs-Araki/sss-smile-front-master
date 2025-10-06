import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- 型定義 ---
type ViewType = 'hour' | 'day';

interface TimeRange {
  from: Date;
  to: Date;
}

interface ChartControllerProps {
  /** 表示期間の種類 ('hour' または 'day') */
  viewType: ViewType;
  /** 時間範囲が変更されたときに呼び出されるコールバック */
  onChange: (range: TimeRange) => void;
  /** 現在の日付 */
  date: Date;
}

/**
 * 現在の日付から時間オフセットを計算するヘルパー関数
 */
const calculateOffset = (viewType: ViewType, currentDate: Date, now: Date): number => {
  if (viewType === 'hour') {
    return Math.floor((currentDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  } else { // 'day'
    const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor((currentDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24));
  }
};

/**
 * 指定されたオフセットに基づいて時間範囲を計算するヘルパー関数
 */
const calculateTimeRange = (viewType: ViewType, offset: number, baseDate: Date): TimeRange => {
  const now = new Date(baseDate);
  let from: Date;
  let to: Date;

  if (viewType === 'hour') {
    to = new Date(now);
    to.setHours(to.getHours() + offset);
    from = new Date(to);
    from.setHours(from.getHours() - 1);
  } else { // 'day'
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 0, 0, 0, 0);
    to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 23, 59, 59, 999);
  }
  return { from, to };
};

export const ChartController = ({
  viewType,
  onChange,
  date,
}: ChartControllerProps) => {
  const [now, setNow] = useState(new Date());

  // 1分ごとに現在時刻を更新して再描画をトリガー
  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(new Date());
    }, 60000); // 60秒
    return () => clearInterval(timerId);
  }, []);

  // 現在の日付から時間オフセットを計算
  const timeOffset = calculateOffset(viewType, date, now);

  // 「次へ」ボタンのクリックハンドラ
  const handleNext = () => {
    if (isNextDisabled) {
      return;
    }
    const newRange = calculateTimeRange(viewType, timeOffset + 1, now);
    onChange(newRange);
  };

  // 「前へ」ボタンのクリックハンドラ
  const handlePrevious = () => {
    const newRange = calculateTimeRange(viewType, timeOffset - 1, now);
    onChange(newRange);
  };

  // 次へボタンが押せるかどうかの判定
  const nextOffset = timeOffset + 1;
  const isNextDisabled = nextOffset > 0;
  //console.log({ nextRange, now, isNextDisabled })

  return (
    <div className="flex shrink items-center justify-center gap-4 w-full select-none">
      {/* --- 左矢印ボタン --- */}
      <Button
        variant="ghost"
        className="border rounded-full p-0 w-9 h-9"
        onClick={handlePrevious}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      {/* --- 右矢印ボタン --- */}
      <Button
        variant="ghost"
        className="border rounded-full p-0 w-9 h-9"
        onClick={handleNext}
        disabled={isNextDisabled}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};
