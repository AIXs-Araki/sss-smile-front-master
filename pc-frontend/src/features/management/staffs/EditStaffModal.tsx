import { Button } from "@/components/ui/button";
import {
  ClosableModal,
  type ClosableModalProps,
} from "../../../components/Modal";
import { useForm, FormProvider } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { MandatoryInput } from "@/components/MandatoryInput";
import { useAddStaff, useEditStaff, useStaffDetail } from "./query";
import { useLoginUser } from "@/hooks/useLoginUser";
import { renderWhenFetched } from "@/lib/loading";
import type { GetStaffMonitor200 } from "@core/api/api-generated";

// モーダルのProps。titleは内部で設定するためOmitします。
type Props = {
  staffId?: number
} & Omit<ClosableModalProps, "title">;

/**
 * スタッフ編集・登録用のモーダルコンポーネント
 */
export function EditStaffModal(props: Props) {
  const loginUser = useLoginUser()
  // alert(JSON.stringify(props))
  const staffQuery = useStaffDetail(loginUser.cid, loginUser.fid, props.staffId!, { query: { enabled: props.open && !!props.staffId } });

  const editStaff = useEditStaff();
  const addStaff = useAddStaff();

  const onSubmit = async (data: GetStaffMonitor200) => {
    if (props.staffId) {
      const result = await editStaff.mutateAsync({
        cid: loginUser.cid,
        fid: loginUser.fid,
        sid: props.staffId,
        data
      })
      if (result.status === 200 && result.data.Result) {
        if (props.onSuccess) props.onSuccess();
        props.close()
      } else {
        toast.error("スタッフの更新に失敗しました:" + result.data.Message)
      }
    } else {
      const result = await addStaff.mutateAsync({
        cid: loginUser.cid,
        fid: loginUser.fid,
        data
      })

      if (result.status === 200 && result.data.Result) {
        if (props.onSuccess) props.onSuccess();
        props.close()
      } else {
        toast.error("スタッフの追加に失敗しました:" + result.data.Message)
      }
    }
  }

  // For new staff creation, use empty default values
  const defaultStaff: GetStaffMonitor200 = {
    Name: "",
    MailAddress: "",
    LINECooperationList: []
  };

  return (
    <ClosableModal
      {...props}
      title={"スタッフ登録"}
      renderButtons={() => (
        <div className="flex gap-2">
          <Button type="submit" form="edit-staff-form">
            登録
          </Button>
          <Button variant="outline" onClick={props.close}>
            キャンセル
          </Button>
        </div>
      )}
    >
      {props.staffId ? (
        renderWhenFetched(staffQuery, {}, (staff) => (
          <EditStaffForm onSubmit={onSubmit} staff={staff} />
        ))
      ) : (
        <EditStaffForm onSubmit={onSubmit} staff={defaultStaff} />
      )}
    </ClosableModal>
  );
}

// Zodを使用してバリデーションスキーマを定義します。
const formSchema = z.object({
  name: z.string().min(1, { message: "名前は必須です。" }),
  email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
});

// スキーマからフォームデータの型を推論します。
type FormData = z.infer<typeof formSchema>;

type EditStaffFormProps = {
  staff: GetStaffMonitor200
  onSubmit: (data: GetStaffMonitor200) => void;
};

/**
 * スタッフ情報のフォームコンポーネント
 */
export function EditStaffForm(props: EditStaffFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: props.staff.Name || "",
      email: props.staff.MailAddress || "",
    },
  });

  const onSubmit = (data: FormData) => {
    const form: GetStaffMonitor200 = {
      Name: data.name,
      MailAddress: data.email,
      // TODO line のデータを送った方が良いのか不明
    }
    props.onSubmit(form);
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          id="edit-staff-form" // モーダルの登録ボタンから参照するためのID
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 p-6"
        >
          {/* 名前フィールド */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>氏名</FormLabel>
                <FormControl>
                  <MandatoryInput placeholder="山田 太郎" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Emailフィールド */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <MandatoryInput
                    type="text"
                    placeholder="yamada@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <span className="text-xs text-gray-500">                ※実際に受信可能なメールアドレスをご記入願います
                </span>
              </FormItem>
            )}
          />

          {/* LINE連携はフォームの入力ではないため、FormField で囲まない */}
          <FormItem>
            <FormLabel>LINE連携</FormLabel>
            <FormControl>
              <LineConnections staff={props.staff} />
            </FormControl>
            {/* このフィールドはバリデーション対象ではないため <FormMessage /> は不要 */}
          </FormItem>
        </form>
      </Form>
    </FormProvider>
  );
}

import type { GetStaffMonitor200AllOfLINECooperationListItem } from "@core/api/api-generated";
import { toast } from "sonner";

const columnHelper = createColumnHelper<GetStaffMonitor200AllOfLINECooperationListItem>();

// テーブルの列定義
const columns = [
  columnHelper.accessor('UserName', {
    header: 'ご利用者氏名',
    size: 100,
  }),
  columnHelper.accessor('RoomNumber', {
    header: '部屋番号',
    size: 80,
  }),
];

type LineConnectionsProps = {
  staff: GetStaffMonitor200;
};

export const LineConnections = ({ staff }: LineConnectionsProps) => {
  const data = staff.LINECooperationList || [];
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });


  return (
    <div className="overflow-x-auto" >
      <div className="w-full inline-block align-middle">
        <div className="border border-gray-400 overflow-hidden rounded-lg w-96">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                        className="px-6 py-1.5 whitespace-nowrap text-sm text-gray-800"
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
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-10 text-sm text-gray-500"
                  >
                    LINE連携はありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
};