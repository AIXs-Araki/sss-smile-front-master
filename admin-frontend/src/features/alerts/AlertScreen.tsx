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
import { useAlertList } from "./query"
import { useParams } from "react-router-dom"
import { mapAlertStatus, toAlertText } from "@core/types/UserCard"

// アラートのデータ型を定義（APIレスポンスに基づく）
export type Alert = {
  AlertTime?: string
  RoomNumber?: string
  UserName?: string
  AlertKinds?: string
  resolvedAt?: Date | undefined
  resolvedBy?: string | undefined
}

export function AlertScreen() {
  const { cid, fid } = useParams<{ cid: string; fid: string }>()

  // APIからアラートデータを取得
  const { data: alertResponse, isLoading, error } = useAlertList(
    cid ? parseInt(cid) : 0,
    fid || ""
  )
  const data = alertResponse?.data?.DataList || []

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
      if (!alert.AlertTime) return true

      // 日付文字列をDateオブジェクトに変換
      const alertDate = new Date(alert.AlertTime)

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
      accessorKey: "AlertTime",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >アラート発生日時</SortableTableHeader>
        )
      },
      cell: (info) => {
        const dateStr = info.getValue() as string
        if (!dateStr) return ""

        // ISO文字列をDateオブジェクトに変換してフォーマット
        const date = new Date(dateStr)
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
      accessorKey: "RoomNumber",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >部屋番号</SortableTableHeader>
        )
      },
    },
    {
      accessorKey: "UserName",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >氏名</SortableTableHeader>
        )
      },
    },
    {
      accessorKey: "AlertKinds",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >アラート種類</SortableTableHeader>
        )
      },
      cell: (info) => {
        const alertKinds = info.getValue() as string | undefined
        const alertStatus = mapAlertStatus(alertKinds)
        return toAlertText(alertStatus)
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

  if (isLoading) {
    return <div className="container mx-auto py-10">読み込み中...</div>
  }

  if (error) {
    return <div className="container mx-auto py-10">エラーが発生しました</div>
  }

  return (
    <div className="container mx-auto py-10">

      <div className="h-8 text-left w-full text-lg font-semibold">
        株式会社ケアサポート  /  ケアサポートセンター東京
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

