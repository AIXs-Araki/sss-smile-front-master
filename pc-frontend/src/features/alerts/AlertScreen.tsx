import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
  type VisibilityState,
} from "@tanstack/react-table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

import { DataTable } from "@/components/DataTable"
import { useMemo, useState } from "react"
import { SortableTableHeader } from "@/components/SortableTableHeader"

// アラートのデータ型を定義
export type Alert = {
  id: string
  datetime: Date
  roomNumber: string
  name: string
  alertType: string
  resolvedAt: Date | undefined,
  resolvedBy: string | undefined,
}

export function AlertScreen() {
  // アラートのサンプルデータで状態を初期化
  const [data] = useState(() => [...sampleAlerts])

  // tanstack table の状態管理
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // 日付範囲フィルタ用の状態
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // 日付範囲でデータをフィルタリング
  const filteredData = useMemo(() => {
    return data.filter(alert => {
      // 日付オブジェクトを取得
      const alertDate = alert.datetime

      // 開始日が設定されていて、アラート日時がそれより前なら除外
      if (startDate && new Date(startDate) > alertDate) {
        return false
      }

      // 終了日が設定されていて、アラート日時がそれより後なら除外
      // ※ 終了日の23:59:59までを範囲に含める
      if (endDate) {
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (endOfDay < alertDate) {
          return false
        }
      }

      return true
    })
  }, [data, startDate, endDate])


  const columns: ColumnDef<Alert>[] = useMemo(() => [
    {
      accessorKey: "datetime",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >アラート発生日時</SortableTableHeader>

        )
      },
      cell: (info) => {
        const date = new Date(info.getValue() as Date)

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
      },
    },
    {
      accessorKey: "roomNumber",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >部屋番号</SortableTableHeader>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >氏名</SortableTableHeader>
        )
      },
    },
    {
      accessorKey: "alertType",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >アラート種類</SortableTableHeader>
        )
      },
    },
    {
      accessorKey: "resolvedAt",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >アラート解除日時</SortableTableHeader>
        )
      },
      cell: (info) => {
        const date = info.getValue() as Date | undefined
        if (!date) return ""

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
      },
    },
    {
      accessorKey: "resolvedBy",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >アラート解除者</SortableTableHeader>
        )
      },
      cell: (info) => {
        const value = info.getValue() as string | undefined
        return value || ""
      },
    },
  ], []);


  const table = useReactTable({
    data: filteredData, // フィルタリング済みのデータをテーブルに渡す
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  })

  // 日付フィルターをクリアする関数
  const handleClearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  }

  return (
    <div className="container mx-auto py-10">

      <div className="h-8 text-left w-full text-lg font-semibold">
        アラート履歴
      </div>
      <div className="flex items-center justify-between py-4 gap-x-4">
        {/* 日付範囲フィルター */}
        <div className="flex items-center gap-x-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-auto"
          />
          <span>〜</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-auto"
          />
          <Button variant="outline" onClick={handleClearDateFilter}>クリア</Button>
        </div>

        {/* グローバル検索フィルター */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="部屋番号、氏名などで絞り込み"
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        table={table}
      />
    </div>
  )
}

// サンプルデータ
const sampleAlerts: Alert[] = [
  {
    id: 'alt_001',
    datetime: new Date('2024-05-20T08:30:15Z'),
    roomNumber: '101号室',
    name: '田中 健太',
    alertType: '心拍下',
    resolvedAt: new Date('2024-05-20T09:15:30Z'),
    resolvedBy: '看護師 山田',
  },
  {
    id: 'alt_002',
    datetime: new Date('2024-05-21T14:05:45Z'),
    roomNumber: '205号室',
    name: '佐藤 花子',
    alertType: '離床',
    resolvedAt: undefined,
    resolvedBy: undefined,
  },
  {
    id: 'alt_003',
    datetime: new Date('2024-06-01T22:15:00Z'),
    roomNumber: '302号室',
    name: '鈴木 一郎',
    alertType: '呼吸下',
    resolvedAt: new Date('2024-06-01T22:45:12Z'),
    resolvedBy: '看護師 佐々木',
  },
  {
    id: 'alt_004',
    datetime: new Date('2024-06-10T09:00:30Z'),
    roomNumber: '101号室',
    name: '田中 健太',
    alertType: '体動',
    resolvedAt: undefined,
    resolvedBy: undefined,
  },
  {
    id: 'alt_005',
    datetime: new Date('2024-06-15T18:50:20Z'),
    roomNumber: '410号室',
    name: '高橋 美咲',
    alertType: '心拍上',
    resolvedAt: new Date('2024-06-15T19:20:45Z'),
    resolvedBy: '看護師 田村',
  },
  {
    id: 'alt_006',
    datetime: new Date('2024-06-16T03:22:10Z'),
    roomNumber: '203号室',
    name: '伊藤 次郎',
    alertType: '離床',
    resolvedAt: undefined,
    resolvedBy: undefined,
  },
  {
    id: 'alt_007',
    datetime: new Date('2024-06-17T11:45:33Z'),
    roomNumber: '305号室',
    name: '渡辺 恵子',
    alertType: '心拍上',
    resolvedAt: new Date('2024-06-17T12:10:15Z'),
    resolvedBy: '看護師 中村',
  },
  {
    id: 'alt_008',
    datetime: new Date('2024-06-18T16:30:22Z'),
    roomNumber: '108号室',
    name: '加藤 正男',
    alertType: '呼吸下',
    resolvedAt: undefined,
    resolvedBy: undefined,
  },
  {
    id: 'alt_009',
    datetime: new Date('2024-06-19T07:15:55Z'),
    roomNumber: '401号室',
    name: '小林 真理',
    alertType: '体動',
    resolvedAt: new Date('2024-06-19T07:45:20Z'),
    resolvedBy: '看護師 松本',
  },
  {
    id: 'alt_010',
    datetime: new Date('2024-06-20T20:05:18Z'),
    roomNumber: '210号室',
    name: '木村 太郎',
    alertType: '心拍下',
    resolvedAt: undefined,
    resolvedBy: undefined,
  },
]