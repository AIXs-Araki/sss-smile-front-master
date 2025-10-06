import { useCallback, useMemo, useState } from "react"
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
import type { User } from "../users/UsersScreen"
import { EditGroupModal } from "./EditGroupModal"
import { useModal } from "@core/hooks/useModal"
import { EditRoomModal } from "./EditRoomModal"
import { ConfirmationModal } from "@/components/ConfirmationModal"
import { SortableTableHeader } from "@/components/SortableTableHeader"
import { useDeleteRoom, useRoomList } from "./query"
import { useLoginUser } from "@/hooks/useLoginUser"
import { toast } from "sonner";
import type { GetRoomListMonitor200AllOfDataListItem } from "@core/api/api-generated"

export type Room = {
  id: number
  roomNo: string
  user: User
  groupId: number,
  groupName: string,
  deviceID: string,
  updatedAt: string
}

type ApiRoom = GetRoomListMonitor200AllOfDataListItem;

export function RoomsScreen() {
  /** modals */
  const editGroupModal = useModal();
  const editRoomModal = useModal<{ roomId?: number }>();
  const deleteRoomModal = useModal<ApiRoom>();

  /** queries */
  const deleteRoom = useDeleteRoom();
  const loginUser = useLoginUser();
  const roomQuery = useRoomList(loginUser.cid, loginUser.fid)
  const roomListData = roomQuery.data

  const openEditModal = editRoomModal.open;
  const openConfirmationModal = deleteRoomModal.open;

  // 新規登録ボタンのコールバック
  const handleClickCreate = useCallback(async () => {
    openEditModal({})
  }, [openEditModal])

  const rooms = roomQuery.data?.data.DataList;
  // 新規登録ボタンのコールバック
  const handleClickEdit = useCallback(async (room: Room) => {
    openEditModal({ roomId: room.id })
  }, [openEditModal])

  const handleClickDelete = useCallback((room: Room) => {
    const apiRoom = rooms?.find((r) => r.RoomID === room.id)
    openConfirmationModal(apiRoom)
  }, [openConfirmationModal, rooms])

  const onDeleteRoom = async () => {
    try {
      const result = await deleteRoom.mutateAsync({ cid: loginUser.cid, fid: loginUser.fid, rid: deleteRoomModal.input!.RoomID! });
      if (result.status === 200) {
        roomQuery.refetch();
        toast.error("部屋の削除に成功しました");
      } else {
        toast.error("部屋の削除に失敗しました");
      }
    } catch {
      toast.error("部屋の削除に失敗しました");
    }
  }

  const columns: ColumnDef<Room>[] = useMemo(() => (
    [
      {
        accessorKey: "roomNo",
        header: ({ column }) => {
          return (
            <SortableTableHeader column={column} >部屋名</SortableTableHeader>
          )
        },
      },
      {
        accessorKey: "user",
        header: ({ column }) => {
          return (
            <SortableTableHeader column={column} >氏名</SortableTableHeader>
          )
        },
        cell: (info) => {
          const user = info.getValue() as User;
          return user.name;
        },
      },
      {
        accessorKey: "groupName",
        header: ({ column }) => {
          return (
            <SortableTableHeader column={column} >グループ</SortableTableHeader>
          )
        },
      },

      {
        accessorKey: "deviceID",
        header: ({ column }) => {
          return (
            <SortableTableHeader column={column} >デバイスID</SortableTableHeader>
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
          const dateString = info.getValue() as string;
          if (!dateString) return '';

          try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
          } catch {
            return dateString;
          }
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
                  onClick={() => handleClickEdit(item)}
                >
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleClickDelete(item)}
                >
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ]), [handleClickEdit, handleClickDelete])


  const data = useMemo(() => {
    if (!roomListData?.data.DataList) return []

    return roomListData.data.DataList.map(item => ({
      id: item.RoomID || 0,
      roomNo: item.RoomNumber || '',
      user: { name: item.UserName || '' } as User,
      groupId: item.GroupID || 0,
      groupName: item.GroupName || '',
      deviceID: item.DeviceID || '',
      updatedAt: item.UpdatedTime || ''
    }))
  }, [roomListData])

  // tanstack table の状態管理
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

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
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const room = row.original;
      const searchTerms = filterValue.replace(/\u3000/g, ' ').split(' ').filter((term) => term.trim());

      // 部屋名、氏名、グループ、デバイスIDのみを対象にAND検索
      const roomNo = room.roomNo.toLowerCase();
      const userName = room.user.name.toLowerCase();
      const groupName = room.groupName.toLowerCase();
      const deviceID = room.deviceID.toLowerCase();
      const searchableText = `${roomNo} ${userName} ${groupName} ${deviceID}`;

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
          <Button onClick={() => editGroupModal.open()}>グループ名編集</Button>

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
      <EditRoomModal {...editRoomModal.props} key={editRoomModal.key} onSuccess={() => roomQuery.refetch()} />
      <EditGroupModal {...editGroupModal.props} key={editGroupModal.key} onSuccess={() => roomQuery.refetch()} />
      <ConfirmationModal message="部屋を削除します｡よろしいですか?" {...deleteRoomModal.props} key={deleteRoomModal.key} onOK={onDeleteRoom} />
    </div>
  )
}

