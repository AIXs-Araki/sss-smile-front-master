import { Button } from "@/components/ui/button";
import {
  ClosableModal,
  type ClosableModalProps,
} from "@/components/Modal";
import { useForm, FormProvider } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddDevice, useEditDevice, useDeviceList, useDeviceKindList } from "./query";
import { toast } from "sonner";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// モーダルのProps。titleは内部で設定するためOmitします。
type Props = {
  onSuccess?: () => void;
  input?: { deviceId?: string };
} & Omit<ClosableModalProps, "title">;

/**
 * デバイス編集・登録用のモーダルコンポーネント
 */
export function EditSingleDeviceModal(props: Props) {
  return (
    <ClosableModal
      {...props}
      title={"デバイス登録"}
      renderButtons={() => (
        <div className="flex gap-2">
          <Button type="submit" form="edit-device-form">
            登録
          </Button>
          <Button variant="outline" onClick={props.close}>
            キャンセル
          </Button>
        </div>
      )}
    >
      {/* フォーム送信成功時にモーダルを閉じるため、close関数を渡します */}
      <EditDeviceForm onSubmitted={() => { props.close(); props.onSuccess?.(); }} deviceId={props.input?.deviceId} modalOpen={props.open} />
    </ClosableModal>
  );
}

// Zodを使用してバリデーションスキーマを定義します。
const formSchema = z.object({
  deviceId: z.string().min(1, { message: "デバイスIDは必須です。" }),
  deviceType: z.string().min(1, { message: "種類を選択してください。" }),
});

// スキーマからフォームデータの型を推論します。
type FormData = z.infer<typeof formSchema>;

type EditDeviceFormProps = {
  onSubmitted: () => void;
  deviceId?: string;
  modalOpen?: boolean;
};

/**
 * デバイス情報のフォームコンポーネント
 */
export function EditDeviceForm({ onSubmitted, deviceId, modalOpen }: EditDeviceFormProps) {
  const addDevice = useAddDevice();
  const editDevice = useEditDevice();
  const deviceQuery = useDeviceList();
  const deviceKindQuery = useDeviceKindList({ query: { enabled: modalOpen } });

  const deviceKinds = deviceKindQuery.data?.data?.DataList || [];

  console.log('EditDeviceForm render:', { deviceId, deviceKindsLength: deviceKinds.length });

  // 編集時の初期値を計算
  const initialValues = useMemo(() => {
    if (deviceId && deviceQuery.data?.data?.DataList) {
      const device = deviceQuery.data.data.DataList.find(item => item.DeviceID === deviceId);
      if (device) {
        return {
          deviceId: device.DeviceID || "",
          deviceType: device.DeviceType || "",
        };
      }
    }
    return {
      deviceId: "",
      deviceType: "",
    };
  }, [deviceId, deviceQuery.data?.data?.DataList]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  console.log('Initial values:', initialValues);
  console.log('Current form values:', form.getValues());



  const onSubmit = async (data: FormData) => {
    try {
      let result;
      if (deviceId) {
        // 編集の場合
        result = await editDevice.mutateAsync({
          did: deviceId,
          data: {
            DeviceID: data.deviceId,
            DeviceType: data.deviceType
          }
        });
      } else {
        // 新規登録の場合
        result = await addDevice.mutateAsync({
          data: {
            DeviceList: [
              {
                DeviceID: data.deviceId,
                DeviceTypeName: deviceKinds.find(k => k.DeviceTypeCode === data.deviceType)?.DeviceTypeName || "",
              }
            ]

          }
        });
      }

      if (result.status === 200) {
        toast.success(deviceId ? "デバイスの編集に成功しました" : "デバイスの登録に成功しました");
        onSubmitted();
      } else {
        toast.error(deviceId ? "デバイスの編集に失敗しました" : "デバイスの登録に失敗しました");
      }
    } catch (e) {
      console.error(e);
      toast.error(deviceId ? "デバイスの編集に失敗しました" : "デバイスの登録に失敗しました");
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          id="edit-device-form" // モーダルの登録ボタンから参照するためのID
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 p-6"
        >
          {/* デバイスIDフィールド */}
          <FormField
            control={form.control}
            name="deviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>デバイスID</FormLabel>
                <FormControl>
                  <Input placeholder="デバイスID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* デバイス種類フィールド */}
          <FormField
            control={form.control}
            name="deviceType"
            render={({ field }) => {
              console.log('DeviceType field render:', {
                value: field.value,
                deviceKinds: deviceKinds.map(k => ({ code: k.DeviceTypeCode, name: k.DeviceTypeName })),
                fieldName: field.name
              });
              return (
                <FormItem>
                  <FormLabel>種類</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deviceKinds.map((kind) => (
                        <SelectItem key={kind.DeviceTypeCode} value={kind.DeviceTypeCode!}>
                          {kind.DeviceTypeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

        </form>
      </Form>
    </FormProvider>
  );
}
