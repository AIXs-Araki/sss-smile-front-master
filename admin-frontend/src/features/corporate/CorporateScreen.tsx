
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

import { MoreHorizontal } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/DataTable"
import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { SortableTableHeader } from "@/components/SortableTableHeader"
import { useModal } from "@core/hooks/useModal"
import { ConfirmationModal } from "@/components/ConfirmationModal"
import { useCorporateList, useDeleteCorporate } from "./query"
import type { GetCorporationsManage200AllOfDataListItem } from "@core/api/api-generated"
import { toast } from "sonner"

export type Corporate = {
  id: number
  corporateName: string
  comment: string
  updatedAt: Date
}

function convertToCorporate(dataList?: GetCorporationsManage200AllOfDataListItem[]): Corporate[] {
  if (!dataList) return [];

  return dataList.map(item => ({
    id: item.CorpID || 0,
    corporateName: item.CorpName || '',
    comment: item.Comment || '',
    updatedAt: new Date(item.UpdatedTime || '')
  }));
}

export function CorporateScreen() {
  const corporateQuery = useCorporateList();
  const deleteCorporate = useDeleteCorporate();
  const confirmationModal = useModal<{ corporateId: number }>();

  const dataList = corporateQuery.data?.data.DataList;
  const data = useMemo(() => {
    const result = convertToCorporate(dataList);
    return result;
  }, [dataList])

  // tanstack table の状態管理
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const openConfirmationModal = confirmationModal.open;

  const navigate = useNavigate()

  const refresh = useCallback(() => {
    corporateQuery.refetch();
  }, [corporateQuery])

  const onDeleteCorporate = useCallback(async () => {
    try {
      const result = await deleteCorporate.mutateAsync({ params: { CorpID: confirmationModal.input!.corporateId } });
      if (result.status === 200) {
        refresh();
        toast.success("法人の削除に成功しました");
      } else {
        toast.error("法人の削除に失敗しました");
      }
    } catch (e) {
      console.error(e)
      toast.error("法人の削除に失敗しました");
    }
  }, [refresh, confirmationModal.input, deleteCorporate])
  const columns: ColumnDef<Corporate>[] = useMemo(() => [

    {
      accessorKey: "corporateName",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >法人名</SortableTableHeader>

        )
      },
    },
    {
      accessorKey: "comment",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >コメント</SortableTableHeader>
        )
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >最終更新日時</SortableTableHeader>
        )
      },
      cell: (info) => {
        const date = new Date(info.getValue() as Date);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
      },
    },

    // Actions Column (動的メニュー)
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">操作</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  navigate(`/facility/${item.id}`)
                }}
              >
                編集
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openConfirmationModal({ corporateId: item.id })}
              >
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [openConfirmationModal, navigate]);



  const table = useReactTable({
    data,
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

  // 新規登録ボタンのコールバック
  const handleClickCreate = () => {
    navigate("/facility/new");
  }



  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-x-2">
          <Button onClick={handleClickCreate}>新規登録</Button>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="絞り込み"
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        table={table}
      />

      <ConfirmationModal message="法人を削除します｡よろしいですか?" {...confirmationModal.props} key={confirmationModal.key} onOK={onDeleteCorporate} />
    </div>
  )
}
