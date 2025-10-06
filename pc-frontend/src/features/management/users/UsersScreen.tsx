import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { useCallback, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

import { MoreHorizontal } from "lucide-react"

import { ConfirmationModal } from "@/components/ConfirmationModal"
import { DataTable } from "@/components/DataTable"
import { SortableTableHeader } from "@/components/SortableTableHeader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataDownloadModal } from "@/features/download/DataDownloadScreen"
import { useLoginUser } from "@/hooks/useLoginUser"
import { type GetUserInformationListMonitor200AllOfDataListItem } from "@core/api/api-generated"
import { useModal } from "@core/hooks/useModal"
import type { Gender, UserCardData } from "@core/types/UserCard"
import { toast } from "sonner"
import { EditUserModal } from "./EditUserModal"
import { useDeleteUser, useEditUser, useGetUserInformationMonitorMutation, useUserList } from "./query"

export type User = {
  id: string
  name: string
  status: "IN" | "OUT"
  gender: Gender
  birthday: Date,
  updatedAt: Date
}

function convertToUser(dataList?: GetUserInformationListMonitor200AllOfDataListItem[]): User[] {
  if (!dataList) return [];

  return dataList.map(item => ({
    id: item.UserID || '',
    name: item.Name || '',
    status: item.MoveInStatus === 'IN' ? 'IN' : 'OUT',
    gender: item.Gender === 'MALE' ? 'male' : 'female',
    birthday: new Date(item.BirthDay || ''),
    updatedAt: new Date(item.UpdatedTime || '')
  }));
}

export function UsersScreen() {
  /** modals */
  const leaveConfirmationModal = useModal<{ uid: string }>();
  const enterConfirmationModal = useModal<{ uid: string }>();
  const deleteConfirmationModal = useModal<{ uid: string }>();
  const dataDownloadModal = useModal<{ user: User, card: { roomNumber: string, userName: string } }>();
  const editUserModal = useModal<{ uid: string }>();
  const deleteUser = useDeleteUser();


  const loginUser = useLoginUser();
  const usersQuery = useUserList({ CorpID: loginUser.cid, FacilityID: loginUser.fid });

  const openLeaveConfirmationModal = leaveConfirmationModal.open;
  const openEnterConfirmationModal = enterConfirmationModal.open;
  const openDeleteConfirmationModal = deleteConfirmationModal.open;
  const openDataDownloadModal = dataDownloadModal.open;
  const openEditUserModal = editUserModal.open;


  const [showActive, setShowActive] = useState(true);
  const [showLeft, setShowLeft] = useState(true);

  const data = useMemo(() => {
    const users = convertToUser(usersQuery.data?.data.DataList)
    return users.filter(user => {
      if (showActive && user.status === "IN") {
        return true;
      }
      if (showLeft && user.status === "OUT") {
        return true;
      }
      return false;
    });
  }, [showActive, showLeft, usersQuery.data?.data.DataList]);

  /** click handler */
  const handleClickCreate = () => {
    openEditUserModal();
  }

  const handleClickEdit = useCallback(async (user: User) => {
    openEditUserModal({ uid: user.id })
  }, [openEditUserModal])

  const handleClickDelete = useCallback((user: User) => {
    openDeleteConfirmationModal({ uid: user.id })
  }, [openDeleteConfirmationModal])


  const handleClickEnterLeave = useCallback((user: User) => {
    if (user.status === "IN") {
      openLeaveConfirmationModal({ uid: user.id });
    } else {
      openEnterConfirmationModal({ uid: user.id });

    }
  }, [openEnterConfirmationModal, openLeaveConfirmationModal])

  /** logic */
  const refresh = useCallback(() => {
    usersQuery.refetch();
  }, [usersQuery])

  const onDeleteUser = useCallback(async () => {
    try {
      const result = await deleteUser.mutateAsync({ uid: deleteConfirmationModal.input!.uid!, data: { CorpID: loginUser.cid, FacilityID: loginUser.fid } });
      if (result.status === 200) {
        usersQuery.refetch();
        toast.error("ユーザーの削除に成功しました");
      } else {
        toast.error("ユーザーの削除に失敗しました");
      }
    } catch (e) {
      console.error(e);
      toast.error("ユーザーの削除に失敗しました");
    }
  }, [deleteConfirmationModal.input, loginUser.cid, loginUser.fid, deleteUser, usersQuery])

  const editUser = useEditUser();
  const getUserInfoMutation = useGetUserInformationMonitorMutation();
  const onEnterLeave = useCallback(async (uid: string, status: "IN" | "OUT") => {
    try {
      const userDetailResult = await getUserInfoMutation.mutateAsync({ uid, params: { CorpID: loginUser.cid, FacilityID: loginUser.fid } });
      const userData = userDetailResult.data;

      if (!userData) {
        toast.error("ユーザー情報の取得に失敗しました");
        return;
      }

      const updateData = {
        UserName: userData.UserName || "",
        UserNameKana: userData.UserNameKana || "",
        Gender: userData.Gender || "MALE",
        BirthYear: userData.BirthYear,
        BirthMonth: userData.BirthMonth,
        BirthDay: userData.BirthDay,
        MoveInStatus: status,
        LINECooperation: userData.LINECooperation?.map(line => line.StaffID).filter(id => id !== undefined) || [],
        CarekarteID: userData.CarekarteID || "",
        CorpID: loginUser.cid,
        FacilityID: loginUser.fid
      };

      const result = await editUser.mutateAsync({
        uid: uid,
        data: updateData,
      });

      if (result.status === 200 && result.data.Result) {
        usersQuery.refetch();
        toast.success(status === "IN" ? "入居処理が完了しました" : "退去処理が完了しました");
      } else {
        toast.error("ステータスの更新に失敗しました: " + result.data.Message);
      }
    } catch (e) {
      console.error(e);
      toast.error("ステータスの更新に失敗しました");
    }
  }, [editUser, loginUser.cid, loginUser.fid, usersQuery, getUserInfoMutation])

  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      accessorKey: "status",
      header: () => {
        return (
          <Button
            variant="ghost"
          >
            入居状況
          </Button>
        )
      },
      cell: (info) => {
        const status = info.getValue();
        return status === "IN" ? "入居" : "退去";
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
      accessorKey: "gender",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >性別</SortableTableHeader>

        )
      },
      cell: (info) => {
        const gender = info.getValue();
        return gender === "male" ? "男性" :
          gender === "female" ? "女性" : "--";
      },
    },
    {
      accessorKey: "birthday",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >生年月日</SortableTableHeader>

        )
      },
      cell: (info) => {
        const date = new Date(info.getValue() as Date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
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
                onClick={() => handleClickEdit(item)}
              >
                編集
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleClickEnterLeave(item)}
              >
                {item.status === "IN" ? "退居" : "入居"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDataDownloadModal({ user: item, card: { roomNumber: "", userName: item.name } as UserCardData })}
              >
                データダウンロード
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
  ], [handleClickEnterLeave, handleClickDelete, openDataDownloadModal, handleClickEdit])


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
      const user = row.original;
      const searchTerms = filterValue.replace(/\u3000/g, ' ').split(' ').filter(term => term.trim());

      // 氏名、生年月日、性別のみを対象にAND検索
      const name = user.name.toLowerCase();
      const birthday = user.birthday.toLocaleDateString('ja-JP').replace(/\//g, '/');
      const gender = user.gender === 'male' ? '男性' : user.gender === 'female' ? '女性' : '';
      const searchableText = `${name} ${birthday} ${gender}`;

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

          <div className="flex items-center space-x-2 px-2">
            <Checkbox
              id="show-active"
              checked={showActive}
              onCheckedChange={(checked) => setShowActive(!!checked)}
            />
            <label
              htmlFor="show-active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >入居者表示</label>
          </div>
          <div className="flex items-center space-x-2 px-2">
            <Checkbox
              id="show-left"
              checked={showLeft}
              onCheckedChange={(checked) => setShowLeft(!!checked)}
            />
            <label
              htmlFor="show-left"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >退去者表示</label>
          </div>
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
        getCellClassName={getCellClassName}
      />

      <ConfirmationModal
        message="退去します｡よろしいですか?"
        {...leaveConfirmationModal.props}
        key={leaveConfirmationModal.key}
        onOK={() => {
          if (leaveConfirmationModal.input?.uid) {
            onEnterLeave(leaveConfirmationModal.input.uid, "OUT");
          }
        }}
      />
      <ConfirmationModal
        message="入居します｡よろしいですか?"
        {...enterConfirmationModal.props}
        key={enterConfirmationModal.key}
        onOK={() => {
          if (enterConfirmationModal.input?.uid) {
            onEnterLeave(enterConfirmationModal.input.uid, "IN");
          }
        }}
      />
      <ConfirmationModal message="ユーザーを削除します｡よろしいですか?" {...deleteConfirmationModal.props} key={deleteConfirmationModal.key} onOK={onDeleteUser} onSuccess={refresh} />
      <DataDownloadModal {...dataDownloadModal.props} key={dataDownloadModal.key} />
      <EditUserModal {...editUserModal.props} key={editUserModal.key} onSuccess={refresh} />
    </div>
  )
}

// データに応じて行のクラス名を返す関数
const getCellClassName = (item: User): string => {
  if (item.status === "OUT") {
    return "bg-gray-400"
  }
  return ""
}

