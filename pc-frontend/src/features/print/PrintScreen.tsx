'use client';

import { ClosableModal, type ClosableModalProps } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserHeaderForModal } from '@/components/UserHeader';
import { Printer } from 'lucide-react';
import * as React from 'react';
import { PrintableFrame } from './PrintableFrame';
import { ReportContent } from './ReportContent';
import type { UserCardData } from '@core/types/UserCard';

/**
 * 過去Nヶ月分の年月のリストを生成するヘルパー関数
 * @param numberOfMonths 遡る月数
 * @returns { value: "YYYY-MM", label: "YYYY年 M月" } の配列
 */
const getPastMonths = (numberOfMonths: number): { value: string; label: string }[] => {
  const months = [];
  const today = new Date();
  for (let i = 0; i < numberOfMonths; i++) {
    // getMonth()からiを引くことで過去の月に遡る
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // "YYYY-MM" 形式のvalue
    const value = `${year}${String(month).padStart(2, '0')}`;
    // "YYYY年 M月" 形式の表示ラベル
    const label = `${year}年 ${month}月`;

    months.push({ value, label });
  }
  return months;
};



type Props = {
  card: UserCardData;
} & Omit<ClosableModalProps, "title">

export function PrintModal(props: Props) {
  const availableMonths = React.useMemo(() => getPastMonths(36), []);
  const [yearMonth, setYearMonth] = React.useState<string>(availableMonths[0].value);

  const handlePrint = () => {
    window.print();
  };

  return (
    <ClosableModal

      {...props}
      title={"印刷"}
      customStyle={{ width: 1300 }}
      framePanelClassName='w-full sm:max-w-6xl '
      renderButtons={() => {
        return <div className="flex gap-2">
        </div>
      }} >
      {/* 操作パネル（印刷しない部分） */}
      <div className="no-print  flex flex-col bg-gray-100  px-4"  >
        <UserHeaderForModal card={props.card} />
        <header className="no-print container mx-auto mb-8 flex items-center justify-between p-4 bg-white rounded-lg shadow">
          <div className="flex items-center gap-4">
            <Select value={yearMonth} onValueChange={setYearMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="年月を選択" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handlePrint}>
            <Printer /> 印刷する
          </Button>
        </header>
      </div>

      {/* 印刷対象のコンテンツ */}
      <main>
        <PrintableFrame>
          {/* ReportContentにyearMonthを渡す */}
          <ReportContent yearMonth={yearMonth} card={props.card} />
        </PrintableFrame>
      </main>

    </ClosableModal >

  );
}

