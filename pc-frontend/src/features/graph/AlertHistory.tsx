import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { toAlertText, type AlertStatus } from '@core/types/UserCard';
import { useCallback, useMemo, useState } from 'react';
import { useInfiniteAlertData } from './hooks/useInfiniteAlertData';
import { useLocation } from 'react-router-dom';
import { BlockHeader } from './BlockHeader';
import { ChartController } from './ChartController';
import { format } from 'date-fns';
import type { GetUserDataGraphMonitor200AllOfAlertDataListItem } from '@core/api/api-generated';


export interface Alert {
  time: Date;
  type: AlertStatus;
}

const convertToDailyData = (
  data: GetUserDataGraphMonitor200AllOfAlertDataListItem[] | undefined,
  targetDate: Date
): Alert[] => {
  if (!data) return [];
  
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);
  
  return data
    .filter(item => {
      if (!item.AlertTime) return false;
      const alertTime = new Date(item.AlertTime);
      return alertTime >= dayStart && alertTime <= dayEnd;
    })
    .map(item => ({
      time: new Date(item.AlertTime!),
      type: item.AlertKinds! as AlertStatus
    }));
};

interface AlertHistoryProps {
  /** 表示対象の日付 */
  date: Date;
  /** その日に発生したアラートの配列 */
  alerts: Alert[];
}

const useUserId = () => {
  const location = useLocation();
  const userId = (location.pathname.split('/')[4]);
  return userId;
}


export const AlertHistory = () => {
  const [alertHistoryDate, setAlertHistoryDate] = useState(new Date());
  const uid = useUserId();

  const { data, isLoading, checkAndFetchMore } = useInfiniteAlertData({
    uid,
    enabled: !!uid,
    shouldFetchMore: (currentDate, oldestDataTime) => {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      return dayStart < oldestDataTime;
    }
  });

  const onChangeAlertHistoryDate = useCallback((d: { from: Date }) => {
    setAlertHistoryDate(d.from);
    checkAndFetchMore(d.from);
  }, [checkAndFetchMore]);

  const dailyData = useMemo(() => {
    return convertToDailyData(data, alertHistoryDate);
  }, [data, alertHistoryDate]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return <>
    <BlockHeader time={` ${format(alertHistoryDate, 'yyyy/MM/dd')}`} title="アラート情報" style={{ paddingLeft: 16, paddingRight: 15 }} />
    <AlertTable alerts={dailyData} date={alertHistoryDate} />
    <ChartController viewType='day' onChange={onChangeAlertHistoryDate} date={alertHistoryDate} />
  </>
}



// tanstack-tableのコラム定義ヘルパー
const columnHelper = createColumnHelper<Alert>();

// テーブルの列定義
const columns = [
  columnHelper.accessor('time', {
    header: '発生時刻',
    cell: info => info.getValue().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    size: 100,
  }),
  columnHelper.accessor('type', {
    header: '発生アラート',
    cell: info => {
      const type = info.getValue();
      return (
        <span className={`py-1 text-xs font-semibold rounded-full `}>
          {toAlertText(type)}
        </span>
      );
    },
    size: 80,
  }),
];

/**
 * 指定された一日のアラート履歴を表形式で表示するコンポーネント
 */
export const AlertTable: React.FC<AlertHistoryProps> = ({ alerts }) => {
  const table = useReactTable({
    data: alerts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-2 bg-white">

      {/* テーブルのコンテナ。件数が多い場合にスクロールさせる */}
      <div className="overflow-x-auto">
        <div className="w-full align-middle flex">
          <div className="border overflow-hidden rounded-lg">
            <div className=" overflow-y-scroll  max-h-[180px]">
              <table className="divide-y divide-gray-200 min-w-[250px]">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="px-6 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider text-nowrap"
                          style={{ width: header.getSize() }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            className="px-6 py-1 text-center whitespace-nowrap text-sm text-gray-800"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    // アラートがない場合の表示
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center py-10 text-sm text-gray-500 px-2"
                      >
                        この日のアラートはありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};