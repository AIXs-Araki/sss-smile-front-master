import { ConfirmationModal } from "@/components/ConfirmationModal";
import { ModalFrame, type ClosableModalProps } from "@/components/Modal";
import { LineStaffSelect } from "@/features/management/users/LineStaffSelect";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertSettingFields, alertSettingDefaultValues, alertSettingSchemaBase, type AlertSettingFormInstance } from "@/features/monitor/modals/AlertSetting";
import { transformAlertSettingToApi } from "@/features/monitor/utils/alertSettingTransform";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useCallback, useState, type PropsWithChildren } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { MandatoryInput } from "@/components/MandatoryInput";
import { useUserDetail, useEditUser, useAddUser } from "./query";
import { useLoginUser } from "@/hooks/useLoginUser";
import { renderWhenFetched } from "@/lib/loading";
import { toast } from "sonner";
import type { GetUserInformationMonitor200, AddUserInformationMonitorBody, EditUserInformationMonitorBody } from "@core/api/api-generated";

const editUserSchema = z.object({
  name: z.string().min(1, "氏名を入力してください"),
  furigana: z.string().min(1, "ふりがなを入力してください"),
  gender: z.enum(["MALE", "FEMALE"]),
  birthYear: z.string().min(4, "西暦4桁で入力してください").max(4, "西暦4桁で入力してください"),
  birthMonth: z.string().min(1, "月を入力してください").max(2, "月を入力してください"),
  birthDay: z.string().min(1, "日を入力してください").max(2, "日を入力してください"),
  status: z.enum(["IN", "OUT"]),
  lineStaffId: z.number().optional(),
  careKarteId: z.string().optional(),
}).merge(alertSettingSchemaBase)
  .superRefine((data, ctx) => {
    // Birthday validation
    const year = parseInt(data.birthYear, 10);
    const month = parseInt(data.birthMonth, 10) - 1; // Month is 0-indexed
    const day = parseInt(data.birthDay, 10);
    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDay"],
        message: "有効な日付を入力してください",
      });
    }

    // This is the refinement logic from alertSettingSchema
    if (data.wakeUpAlert === "ON" && !data.wakeUpTime) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["wakeUpTime"], message: "時刻を選択してください" });
    }
    if (data.bedExitAlert === "ON") {
      if (!data.bedExitStartTime) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bedExitStartTime"], message: "時刻を選択してください" });
      if (!data.bedExitEndTime) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bedExitEndTime"], message: "時刻を選択してください" });
      if (!data.bedExitJudgeTime) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bedExitJudgeTime"], message: "時間を選択してください" });
    }
    if (data.inBedAlert === "ON") {
      if (!data.inBedStartTime) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["inBedStartTime"], message: "時刻を選択してください" });
      if (!data.inBedEndTime) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["inBedEndTime"], message: "時刻を選択してください" });
      if (!data.inBedJudgeTime) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["inBedJudgeTime"], message: "時間を選択してください" });
    }
  });


type EditUserFormValues = z.infer<typeof editUserSchema>;
type EditUserFormInstance = UseFormReturn<EditUserFormValues>;

type Props = {
  uid?: string;
} & Omit<ClosableModalProps, "title">;

export function EditUserModal(props: Props) {
  const loginUser = useLoginUser();
  const userQuery = useUserDetail(props.uid!, { CorpID: loginUser.cid, FacilityID: loginUser.fid }, { query: { enabled: props.open && !!props.uid } });

  const editUser = useEditUser();
  const addUser = useAddUser();

  const onSubmit = async (data: AddUserInformationMonitorBody | EditUserInformationMonitorBody) => {
    if (props.uid) {
      const result = await editUser.mutateAsync({
        uid: props.uid,
        data: { ...data, ...{ CorpID: loginUser.cid, FacilityID: loginUser.fid } },
      });
      if (result.status === 200 && result.data.Result) {
        if (props.onSuccess) props.onSuccess();
        props.close();
      } else {
        toast.error("ユーザーの更新に失敗しました:" + result.data.Message);
      }
    } else {
      const result = await addUser.mutateAsync({
        data: data,
      });
      if (result.status === 200 && result.data.Result) {
        if (props.onSuccess) props.onSuccess();
        props.close();
      } else {
        toast.error("ユーザーの追加に失敗しました:" + result.data.Message);
      }
    }
  };

  const frameClass = twMerge("sm:max-w-7xl");

  // For new user creation, use empty default values merged with alert defaults
  const defaultUser: GetUserInformationMonitor200 = {
    UserName: "",
    UserNameKana: "",
    Gender: "MALE",
    BirthYear: undefined,
    BirthMonth: undefined,
    BirthDay: undefined,
    MoveInStatus: "IN",
    LINECooperation: [],
    CarekarteID: "",
    ...alertSettingDefaultValues
  };

  return (
    <ModalFrame opened={props.open} close={props.close} maskClosable={true} className={frameClass}>
      {props.uid ? (
        renderWhenFetched(userQuery, {}, (user) => (
          <EditUserForm onSubmit={onSubmit} user={user} close={props.close} />
        ))
      ) : (
        <EditUserForm onSubmit={onSubmit} user={defaultUser} close={props.close} />
      )}
    </ModalFrame>
  );
}

type EditUserFormProps = {
  user: GetUserInformationMonitor200;
  onSubmit: (data: AddUserInformationMonitorBody | EditUserInformationMonitorBody) => void;
  close: () => void;
};

function EditUserForm({ user, onSubmit, close }: EditUserFormProps) {
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.UserName || "",
      furigana: user.UserNameKana || "",
      gender: (user.Gender as "MALE" | "FEMALE") || "MALE",
      birthYear: user.BirthYear?.toString() || "",
      birthMonth: user.BirthMonth?.toString() || "",
      birthDay: user.BirthDay?.toString() || "",
      status: (user.MoveInStatus as "IN" | "OUT") || "IN",
      lineStaffId: user.LINECooperation?.[0]?.StaffID,
      careKarteId: user.CarekarteID || "",
      ...alertSettingDefaultValues,
    },
  });

  const isDirty = form.formState.isDirty;

  const handleClose = useCallback(() => {
    if (isDirty) {
      setConfirmationOpen(true);
    } else {
      close();
    }
  }, [close, isDirty]);

  const handleSubmit = (data: EditUserFormValues) => {
    const userForm = {
      UserName: data.name,
      UserNameKana: data.furigana,
      Gender: data.gender,
      BirthYear: parseInt(data.birthYear),
      BirthMonth: parseInt(data.birthMonth),
      BirthDay: parseInt(data.birthDay),
      MoveInStatus: data.status,
      LINECooperation: data.lineStaffId ? [data.lineStaffId] : [],
      CarekarteID: data.careKarteId,
      ...transformAlertSettingToApi(data),
    };
    onSubmit(userForm);
  };

  const handleConfirmSave = () => {
    form.handleSubmit(handleSubmit)();
    setConfirmationOpen(false);
    close();
  };

  const handleConfirmCancel = () => {
    setConfirmationOpen(false);
    close();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex gap-2 bg-white p-12">
            <div className="w-3/5 border-r border-gray-300 pr-6">
              <Left form={form} />
            </div>
            <div className="w-2/5 h-full">
              <Right form={form} />
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-6 sm:px-6 flex justify-end gap-2">
            <Button type="submit">保存</Button>
            <Button type="button" variant="outline" onClick={handleClose}>キャンセル</Button>
          </div>
        </form>
      </Form>

      <ConfirmationModal
        open={isConfirmationOpen}
        close={() => setConfirmationOpen(false)}
        message="変更が保存されていません。保存して閉じますか？"
        okLabel="保存して閉じる"
        cancelLabel="保存せずに閉じる"
        onOK={handleConfirmSave}
        onCancel={handleConfirmCancel}
      />
    </>
  );
}

const Left = ({ form }: { form: EditUserFormInstance }) => {
  return (
    <div className="space-y-4">
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
      <FormField
        control={form.control}
        name="furigana"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ふりがな</FormLabel>
            <FormControl>
              <Input placeholder="やまだ たろう" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>性別</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex items-center space-x-2"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="MALE" />
                  </FormControl>
                  <FormLabel className="font-normal">男性</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="FEMALE" />
                  </FormControl>
                  <FormLabel className="font-normal">女性</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div>
        <FormLabel>生年月日(西暦)</FormLabel>
        <div className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="birthYear"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MandatoryInput placeholder="1990" {...field} className="w-24" />
                </FormControl>
              </FormItem>
            )}
          />
          <span className="text-sm pb-2">年</span>
          <FormField
            control={form.control}
            name="birthMonth"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MandatoryInput placeholder="1" {...field} className="w-16" />
                </FormControl>
              </FormItem>
            )}
          />
          <span className="text-sm pb-2">月</span>
          <FormField
            control={form.control}
            name="birthDay"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MandatoryInput placeholder="1" {...field} className="w-16" />
                </FormControl>
              </FormItem>
            )}
          />
          <span className="text-sm pb-2">日</span>
        </div>
        <FormField
          control={form.control}
          name="birthDay" // Show validation message under the day field
          render={() => <FormMessage />}
        />
      </div>
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>入居状態</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex items-center space-x-2"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="IN" />
                  </FormControl>
                  <FormLabel className="font-normal">入居</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="OUT" />
                  </FormControl>
                  <FormLabel className="font-normal">退去</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <LineStaffSelect
        control={form.control}
        name="lineStaffId"
        label="LINE 連携"
      />
      <FormField
        control={form.control}
        name="careKarteId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CAREKARTE ID</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

const Right = ({ form }: { form: EditUserFormInstance }) => {
  return (
    <div className="bg-white">
      <AlertSettingFields form={form as unknown as AlertSettingFormInstance} isAISH={false} />
    </div>
  );
};

export function ModalHeader(props: PropsWithChildren<{ close: () => void }>) {
  return (
    <div className="bg-white px-4 py-3 sm:px-6 flex flex-row">
      <button
        type="button"
        className="btn-close box-content p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline h-6 w-6"
        data-bs-dismiss="modal"
        aria-label="Close"
        onClick={props.close}
      >
        <X />
      </button>
    </div>
  );
}
