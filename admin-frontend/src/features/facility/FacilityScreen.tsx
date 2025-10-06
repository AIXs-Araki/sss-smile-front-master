
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
import { EditFacilityModal } from "./EditFacilityModal"
import { useMemo, useState, useCallback, useEffect } from "react"
import { ConfirmationModal } from "@/components/ConfirmationModal"
import { useNavigate, useParams } from "react-router-dom"
import { UploadCsvModal } from "./UploadCsvModal"
import { SortableTableHeader } from "@/components/SortableTableHeader"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { MandatoryInput } from "@/components/MandatoryInput"
import { useFacilityList, useAddCorporate, useEditCorporate, useDeleteFacility, useDownloadCsv } from "./query"
import { useCorporateList } from "../corporate/query"
import type { GetFacilitiesListManage200AllOfDataListItem, GetCorporationsManage200AllOfDataListItem } from "@core/api/api-generated"

export type Facility = {
  id: string
  facilityName: string
  facilityCode: string
  comment: string
  updatedAt: Date
}

function convertToFacility(dataList?: GetFacilitiesListManage200AllOfDataListItem[]): Facility[] {
  if (!dataList) return [];

  return dataList.map(item => ({
    id: item.FacilityID?.toString() || '',
    facilityName: item.FacilityName || '',
    facilityCode: item.FacilityID || '',
    comment: item.Comment || '',
    updatedAt: new Date(item.UpdatedTime || '')
  }));
}

export function FacilityScreen(props: { isNew: boolean }) {
  const { id } = useParams<{ id: string }>();
  const editFacilityModal = useModal<{ facilityId: string, corpId: number, }>();
  const confirmationModal = useModal<{ facilityId: string }>();
  const uploadCsvModal = useModal<{ cid: number, fid: string }>();

  const facilityQuery = useFacilityList(id ? parseInt(id) : 0, { query: { enabled: !!id && !props.isNew } });
  const corporateQuery = useCorporateList();
  const deleteFacility = useDeleteFacility();

  const data = useMemo(() => {
    return convertToFacility(facilityQuery.data?.data.DataList);
  }, [facilityQuery.data?.data.DataList])

  const currentCorporate = useMemo(() => {
    if (!id || !corporateQuery.data?.data.DataList) return null;
    return corporateQuery.data.data.DataList.find(corp => corp.CorpID === parseInt(id));
  }, [id, corporateQuery.data?.data.DataList]);

  // tanstack table の状態管理
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const downloadCsv = useDownloadCsv();

  const navigate = useNavigate()
  const openEditModal = editFacilityModal.open;
  const openConfirmationModal = confirmationModal.open;
  const openUploadCsvModal = uploadCsvModal.open;

  const columns: ColumnDef<Facility>[] = useMemo(() => [

    {
      accessorKey: "facilityName",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >施設名</SortableTableHeader>
        )
      },
    },
    {
      accessorKey: "facilityCode",
      header: ({ column }) => {
        return (
          <SortableTableHeader column={column} >施設コード</SortableTableHeader>
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
        const facility = row.original;
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
                onClick={() => openEditModal({ facilityId: facility.id, corpId: currentCorporate!.CorpID!, })}
              >
                編集
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openConfirmationModal({ facilityId: facility.id })}
              >
                削除
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => { await downloadCsv.mutateAsync({ cid: currentCorporate!.CorpID!, fid: facility.id }) }}
              >
                利用者情報 - 出力
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openUploadCsvModal({ cid: currentCorporate!.CorpID!, fid: facility.id })}
              >
                利用者情報 - 登録
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/alerts/${currentCorporate!.CorpID}/${facility.id}`)}
              >
                アラート情報一覧
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [openEditModal, openConfirmationModal, openUploadCsvModal, navigate, currentCorporate, downloadCsv]);



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
    editFacilityModal.open()
  }

  const handleFacilitySuccess = useCallback(() => {
    facilityQuery.refetch();
  }, [facilityQuery]);

  const onDeleteFacility = useCallback(async () => {
    try {
      const facilityId = confirmationModal.input?.facilityId;
      if (!facilityId || !id) return;

      const result = await deleteFacility.mutateAsync({
        cid: parseInt(id),
        fid: facilityId
      });
      if (result.status === 200) {
        handleFacilitySuccess();
        toast.success("施設の削除に成功しました");
      } else {
        toast.error("施設の削除に失敗しました");
      }
    } catch (e) {
      console.error(e);
      toast.error("施設の削除に失敗しました");
    }
  }, [confirmationModal.input, deleteFacility, handleFacilitySuccess, id]);

  const onSaveCorporate = useCallback((newId: number) => {
    navigate(`/facility/${newId}`);
  }, [navigate]);

  if (props.isNew) {
    return <div className="container mx-auto py-10">
      <div>
        <EditCorporateForm onSaveCorporate={onSaveCorporate} />
      </div>
    </div>
  }

  return (
    <div className="container mx-auto py-10">
      <div>
        <EditCorporateForm id={currentCorporate?.CorpID} corporate={currentCorporate} />
      </div>
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
      <EditFacilityModal {...editFacilityModal.props} key={editFacilityModal.key} onSuccess={handleFacilitySuccess} corpId={id ? parseInt(id) : undefined} />
      <ConfirmationModal message="施設を削除します｡よろしいですか?" {...confirmationModal.props} key={confirmationModal.key} onOK={onDeleteFacility} />
      <UploadCsvModal {...uploadCsvModal.props} key={uploadCsvModal.key} />
    </div>
  )
}


const EditCorporateForm = (props: { id?: number; onSaveCorporate?: (id: number) => void; corporate?: GetCorporationsManage200AllOfDataListItem | null }) => {
  const [corporateName, setCorporateName] = useState(props.corporate?.CorpName || '');
  const [comment, setComment] = useState(props.corporate?.Comment || '');

  // Update form when corporate data changes
  useEffect(() => {
    if (props.corporate) {
      setCorporateName(props.corporate.CorpName || '');
      setComment(props.corporate.Comment || '');
    }
  }, [props.corporate]);

  const addCorporate = useAddCorporate();
  const editCorporate = useEditCorporate();

  const isEdit = !!props.id;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    saveCorporate();
  };

  const { onSaveCorporate, id } = props;
  const saveCorporate = useCallback(async () => {
    if (!id && isEdit) {
      toast.error("法人情報が読み込まれていません");
      return;
    }

    try {
      if (isEdit) {
        const result = await editCorporate.mutateAsync({
          cid: id!,
          data: {
            CorpName: corporateName,
            Comment: comment
          }
        });
        if (result.status === 200) {
          toast.success("法人情報を更新しました");
        }
      } else {
        const result = await addCorporate.mutateAsync({
          data: {
            CorpName: corporateName,
            Comment: comment
          }
        });
        if (result.status === 200 && result.data.CorpID) {
          toast.success("法人情報を登録しました");
          onSaveCorporate?.(result.data.CorpID);
        }
      }
    } catch (error) {
      toast.error(isEdit ? "法人情報の更新に失敗しました" : "法人情報の登録に失敗しました");
      console.error(error)
    }
  }, [corporateName, comment, isEdit, id, onSaveCorporate, addCorporate, editCorporate]);

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-4 p-4 border rounded-xl border-gray-300">
      <div className="flex items-center gap-4">
        <div>
          <Label htmlFor="companyName" className=" ">法人名</Label>
        </div>
        <div>
          <MandatoryInput
            id="companyName"
            name="companyName"
            placeholder="法人名を入力"
            className="w-80"
            value={corporateName}
            onChange={(e) => setCorporateName(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center gap-4">
        <div>
          <Label htmlFor="comment" className="">コメント</Label>
        </div>
        <div className="grow">
          <Input
            id="comment"
            name="comment"
            placeholder="コメントを入力"
            className="w-full"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Button type="submit">{isEdit ? '更新' : '登録'}</Button>
      </div>
    </form>
  );
}
