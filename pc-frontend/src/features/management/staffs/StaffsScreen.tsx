
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
import { useModal } from "@core/hooks/useModal"
import { EditStaffModal } from "./EditStaffModal"
import { useCallback, useMemo, useState } from "react"
import { ConfirmationModal } from "@/components/ConfirmationModal"
import { SortableTableHeader } from "@/components/SortableTableHeader"
import { useDeleteStaff, useStaffList } from "./query"
import { useLoginUser } from "@/hooks/useLoginUser"
import type { GetStaffListMonitor200AllOfDataListItem } from "@core/api/api-generated"
import { toast } from "sonner"

export type Staff = {
  id: number
  name: string
  email: string
  updatedAt: Date
  hasLINE: boolean
}

function convertToStaff(dataList?: GetStaffListMonitor200AllOfDataListItem[]): Staff[] {
  if (!dataList) return [];

  return dataList.map(item => ({
    id: (item.StaffID || 0),
    name: item.Name || '',
    email: item.MailAddress || '',
    updatedAt: new Date(item.UpdatedTime || ''),
    hasLINE: item.LINEIntegration || false
  }));
}

export function StaffsScreen() {
  const editStaffModal = useModal<{ staffId: number }>();
  const deleteStaffModal = useModal<{ staffId: number }>();
  const loginUser = useLoginUser();

  const staffQuery = useStaffList(loginUser.cid, loginUser.fid);
  const deleteStaff = useDeleteStaff();

  const data = useMemo(() => convertToStaff(staffQuery.data?.data.DataList), [staffQuery.data?.data.DataList])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const openEditModal = editStaffModal.open;
  const openDeleteModal = deleteStaffModal.open;

  // 新規登録ボタンのコールバック
  const handleClickCreate = () => {
    editStaffModal.open()
  }

  const refresh = useCallback(() => {
    staffQuery.refetch();
  }, [staffQuery])

  const onDeleteStaff = useCallback(async () => {
    try {
      const result = await deleteStaff.mutateAsync({ cid: loginUser.cid, fid: loginUser.fid, sid: Number(deleteStaffModal.input!.staffId) });
      if (result.status === 200) {
        refresh();
        toast.error("スタッフの削除に成功しました");
      } else {
        toast.error("スタッフの削除に失敗しました");
      }
    } catch (e) {
      console.error(e)
      toast.error("スタッフの削除に失敗しました");
    }
  }, [refresh, deleteStaffModal.input, deleteStaff, loginUser.cid, loginUser.fid])

  const columns: ColumnDef<Staff>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >氏名</SortableTableHeader>
        )
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >E-mail</SortableTableHeader>
        )
      },
    },
    {
      accessorKey: "hasLINE",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >LINE連携</SortableTableHeader>
        )
      },
      cell: (info) => {
        const hasLINE = info.getValue();
        return hasLINE ? "あり" : "なし";
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
                onClick={() => openEditModal({ staffId: item.id })}
              >
                編集
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteModal({ staffId: item.id })}
              >
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [openEditModal, openDeleteModal]);


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
    enableMultiSort: true,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const staff = row.original;
      const searchTerms = filterValue.replace(/\u3000/g, ' ').split(' ').filter(term => term.trim());

      // 氏名、Emailのみを対象にAND検索
      const name = staff.name.toLowerCase();
      const email = staff.email.toLowerCase();
      const searchableText = `${name} ${email}`;

      return searchTerms.every(term =>
        searchableText.includes(term.toLowerCase())
      );
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  })



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
      <EditStaffModal {...editStaffModal.props} key={editStaffModal.key} onSuccess={refresh} />
      <ConfirmationModal message="スタッフを削除します｡よろしいですか?" {...deleteStaffModal.props} key={deleteStaffModal.key} onOK={onDeleteStaff} />

    </div>
  )
}