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
import { Search, MoreHorizontal } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/DataTable"
import { useModal } from "@core/hooks/useModal"
import { useCallback, useMemo, useState } from "react"
import { ConfirmationModal } from "@/components/ConfirmationModal"

// この画面から利用するモーダルをインポート
import { EditSingleDeviceModal } from "./EditSingleDeviceModal"
import { UploadCsvModal } from "./UploadCsvModal"
import { SortableTableHeader } from "@/components/SortableTableHeader"
import { useDeleteDevice, useDeviceList, useDeviceKindList } from "./query"
import { toast } from "sonner"


// デバイスのデータ型を定義
export type Device = {
  id: string;
  deviceId: string;
  type: string;
  registeredAt: Date;
}

export function DeviceScreen() {
  const singleDeviceModal = useModal<{ deviceId?: string }>();
  const bulkDeviceModal = useModal();
  const deleteDeviceModal = useModal<{ deviceId: string }>();
  const deleteDevice = useDeleteDevice();

  const deviceQuery = useDeviceList();
  const deviceKindQuery = useDeviceKindList();

  // APIレスポンスをDevice型に変換
  const data = useMemo(() => {
    if (!deviceQuery.data?.data?.DataList) return [];

    return deviceQuery.data.data.DataList.map(item => ({
      id: item.DeviceID || '',
      deviceId: item.DeviceID || '',
      type: item.DeviceType || '',
      registeredAt: new Date(item.RegisterTime || '')
    }));
  }, [deviceQuery.data?.data?.DataList]);

  // デバイス種別マスターデータを作成
  const deviceTypeMaster = useMemo(() => {
    if (!deviceKindQuery.data?.data?.DataList) return {};

    const master: Record<string, string> = {};
    deviceKindQuery.data.data.DataList.forEach(item => {
      if (item.DeviceTypeCode && item.DeviceTypeName) {
        master[item.DeviceTypeCode] = item.DeviceTypeName;
      }
    });
    return master;
  }, [deviceKindQuery.data?.data?.DataList]);

  // tanstack table の状態管理
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const openSingleDeviceModal = singleDeviceModal.open;
  const openDeleteModal = deleteDeviceModal.open;

  const refresh = useCallback(() => {
    deviceQuery.refetch();
  }, [deviceQuery]);

  const onDeleteDevice = useCallback(async () => {
    try {
      const result = await deleteDevice.mutateAsync({ did: deleteDeviceModal.input!.deviceId });
      if (result.status === 200) {
        refresh();
        toast.success("デバイスの削除に成功しました");
      } else {
        toast.error("デバイスの削除に失敗しました");
      }
    } catch (e) {
      console.error(e);
      toast.error("デバイスの削除に失敗しました");
    }
  }, [refresh, deleteDeviceModal.input, deleteDevice]);
  const columns: ColumnDef<Device>[] = useMemo(() => [
    {
      accessorKey: "deviceId",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >デバイスID</SortableTableHeader>

        )
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >種類</SortableTableHeader>

        )
      },
      // マスターデータを使って表示名を返す
      cell: ({ row }) => {
        const typeCode = row.getValue("type") as string;
        return deviceTypeMaster[typeCode] || "不明";
      }
    },
    {
      accessorKey: "registeredAt",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >登録日時</SortableTableHeader>
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
    {
      id: "actions",
      cell: ({ row }) => {
        const device = row.original;
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
                onClick={() => openSingleDeviceModal({ deviceId: device.id })}
              >
                編集
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteModal({ deviceId: device.id })}
              >
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [openSingleDeviceModal, openDeleteModal, deviceTypeMaster]);


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

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between py-4">
        {/* 左上の登録ボタン群 */}
        <div className="flex items-center gap-x-2">
          <Button onClick={() => singleDeviceModal.open()}>１台登録</Button>
          <Button variant="outline" onClick={() => bulkDeviceModal.open()}>一括登録</Button>
        </div>

        {/* グローバル検索 */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="デバイスIDなどで絞り込み"
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        table={table}
      />

      {/* モーダルコンポーネントを配置 */}
      <EditSingleDeviceModal {...singleDeviceModal.props} input={singleDeviceModal.input} key={singleDeviceModal.key} onSuccess={refresh} />
      <UploadCsvModal {...bulkDeviceModal.props} key={bulkDeviceModal.key} onSuccess={refresh} />
      <ConfirmationModal message="デバイスを削除します｡よろしいですか?" {...deleteDeviceModal.props} key={deleteDeviceModal.key} onOK={onDeleteDevice} />

    </div>
  )
}

