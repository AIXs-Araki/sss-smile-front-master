"use client";

import { type UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback } from "react";
import { toast } from "sonner";
import { useModal } from "@core/hooks/useModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { ToggleSwitch } from "@/components/form/ToggleSwitch";
import { useSaveAlertSetting } from "../query";
import { transformAlertSettingToApi } from "../utils/alertSettingTransform";
import { useLoginUser } from "@/hooks/useLoginUser";

// フォームのスキーマ定義 (Zod)
export const alertSettingSchemaBase = z
  .object({
    // 起床アラート
    wakeUpAlert: z.enum(["ON", "OFF"]),
    wakeUpTime: z.string().optional(),

    // 離床アラート
    bedExitAlert: z.enum(["ON", "OFF"]),
    bedExitStartTime: z.string().optional(),
    bedExitEndTime: z.string().optional(),
    bedExitJudgeTime: z.string().optional(),

    // 臥床アラート
    inBedAlert: z.enum(["ON", "OFF"]),
    inBedStartTime: z.string().optional(),
    inBedEndTime: z.string().optional(),
    inBedJudgeTime: z.string().optional(),

    // 心拍アラート
    heartRateUpperLimit: z.string(),
    heartRateLowerLimit: z.string(),
    heartRateDuration: z.string(),

    // 呼吸アラート
    respirationUpperLimit: z.string(),
    respirationLowerLimit: z.string(),
    respirationDuration: z.string(),

    // センサ感度
    sensorSensitivity: z.enum(["AUTO", "HIGH", "MEDIUM", "LOW"]),
    bedExitLevel: z.enum(["AUTO", "HIGH", "MEDIUM", "LOW"]),
    inBedLevel: z.enum(["AUTO", "HIGH", "MEDIUM", "LOW"]),
  });
export const alertSettingSchema = alertSettingSchemaBase.superRefine((data, ctx) => {
  // 起床アラートがONの場合、wakeUpTimeは必須
  if (data.wakeUpAlert === "ON" && !data.wakeUpTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["wakeUpTime"],
      message: "時刻を選択してください",
    });
  }

  // 離床アラートがONの場合、関連フィールドは必須
  if (data.bedExitAlert === "ON") {
    if (!data.bedExitStartTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bedExitStartTime"],
        message: "時刻を選択してください",
      });
    }
    if (!data.bedExitEndTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bedExitEndTime"],
        message: "時刻を選択してください",
      });
    }
    if (!data.bedExitJudgeTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bedExitJudgeTime"],
        message: "時間を選択してください",
      });
    }
  }

  // 臥床アラートがONの場合、関連フィールドは必須
  if (data.inBedAlert === "ON") {
    if (!data.inBedStartTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["inBedStartTime"],
        message: "時刻を選択してください",
      });
    }
    if (!data.inBedEndTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["inBedEndTime"],
        message: "時刻を選択してください",
      });
    }
    if (!data.inBedJudgeTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["inBedJudgeTime"],
        message: "時間を選択してください",
      });
    }
  }
});

export type AlertSettingFormValues = z.infer<typeof alertSettingSchema>;

export type AlertSettingFormInstance = UseFormReturn<AlertSettingFormValues>;

// フォームの初期値 (画像の値に基づいています)
export const alertSettingDefaultValues: AlertSettingFormValues = {
  wakeUpAlert: "OFF",
  wakeUpTime: "08:00",
  bedExitAlert: "ON",
  bedExitStartTime: "20:00",
  bedExitEndTime: "07:00",
  bedExitJudgeTime: "10",
  inBedAlert: "OFF",
  inBedStartTime: "09:00",
  inBedEndTime: "17:00",
  inBedJudgeTime: "120",
  heartRateUpperLimit: "100",
  heartRateLowerLimit: "40",
  heartRateDuration: "10",
  respirationUpperLimit: "30",
  respirationLowerLimit: "10",
  respirationDuration: "10",
  sensorSensitivity: "AUTO",
  bedExitLevel: "AUTO",
  inBedLevel: "AUTO",
};

// ヘルパー: 時間の選択肢を生成する関数
const generateTimeOptions = (from: number, to: number) => {
  // toがfromより小さい場合や、0-23の範囲外の場合は空の配列を返す
  if (from > to || from < 0 || to > 24) {
    return [];
  }

  const length = to - from + 1;
  return Array.from({ length }, (_, i) => {
    const hour = (from + i).toString().padStart(2, '0');
    return `${hour}:00`;
  });
};
// ヘルパー: 分の選択肢を生成する関数
const generateMinuteOptions = (from: number, to: number, step: number = 1): string[] => {
  // Ensure step is positive to prevent infinite loops
  if (step <= 0 || from > to) {
    return [];
  }

  const options: string[] = [];
  for (let i = from; i <= to; i += step) {
    options.push((i).toString());
  }
  return options;
};

const generateThresholdOptions = (from: number, to: number, step: number = 1): (string | number)[] => {
  // Validate input to prevent infinite loops
  if (step <= 0 || from > to) {
    return ['OFF']; // Return only 'OFF' if the range is invalid
  }

  const numericOptions: number[] = [];
  for (let i = from; i <= to; i += step) {
    numericOptions.push(i);
  }

  // Use the spread syntax to prepend 'OFF' to the numeric options
  return ['OFF', ...numericOptions];
};




export const AlertSettingFields = ({
  form,
  isAISH,
}: {
  form: AlertSettingFormInstance;
  isAISH: boolean;
}) => {
  const wakeUpAlert = form.watch("wakeUpAlert");
  const bedExitAlert = form.watch("bedExitAlert");
  const inBedAlert = form.watch("inBedAlert");

  const renderSelect = (
    name: keyof AlertSettingFormValues,
    placeholder: string,
    items: (string | number)[],
    disabled: boolean = false,
  ) => (
    <div className="w-full flex justify-end">
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className="data-[size=default]:h-6 data-[size=sm]:h-6 py-1 text-sm min-w-20 data-[disabled]:text-gray-600  data-[disabled]:bg-gray-200 data-[disabled]:opacity-70">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {items.map(item => <SelectItem key={item} value={String(item)}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderOnOffSelect = (name: keyof AlertSettingFormValues) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <ToggleSwitch color="primary" onCheckedChange={(e) => field.onChange(e ? "ON" : "OFF")} checked={field.value !== "OFF"} />
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <>
      <div className="space-y-2 p-2 border-b">
        {/* 起床アラート */}
        <div className="grid grid-cols-[112px_100px_1fr] items-center gap-2">
          <FormLabel>起床アラート</FormLabel>
          {renderOnOffSelect("wakeUpAlert")}
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4">
            <FormLabel>判定時刻</FormLabel>
            {renderSelect(
              "wakeUpTime",
              "時刻選択",
              generateTimeOptions(6, 12),
              wakeUpAlert === "OFF",
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2 p-2 border-b">

        {/* 離床アラート */}
        <div className="grid grid-cols-[112px_100px_1fr] items-start gap-2">
          <FormLabel className="pt-2">離床アラート</FormLabel>
          <div className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-2">
            {renderOnOffSelect("bedExitAlert")}
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-[100px_1fr] items-center gap-x-4">
              <FormLabel>判定開始時刻</FormLabel>
              {renderSelect(
                "bedExitStartTime",
                "時刻選択",
                generateTimeOptions(0, 23),
                bedExitAlert === "OFF",
              )}
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-x-4">
              <FormLabel>判定終了時刻</FormLabel>
              {renderSelect(
                "bedExitEndTime",
                "時刻選択",
                generateTimeOptions(1, 24),
                bedExitAlert === "OFF",
              )}
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-x-4">
              <FormLabel>判定時間</FormLabel>
              {renderSelect(
                "bedExitJudgeTime",
                "分選択",
                generateMinuteOptions(isAISH ? 0 : 1, 60),
                bedExitAlert === "OFF",
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 p-2 border-b">
        {/* 臥床アラート */}
        <div className="grid grid-cols-[112px_100px_1fr] items-start gap-2">
          <FormLabel className="pt-2">臥床アラート</FormLabel>
          <div className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-2">
            {renderOnOffSelect("inBedAlert")}
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-[100px_1fr] items-center gap-x-4">
              <FormLabel>判定開始時刻</FormLabel>
              {renderSelect(
                "inBedStartTime",
                "時刻選択",
                generateTimeOptions(8, 11),
                inBedAlert === "OFF",
              )}
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-x-4">
              <FormLabel>判定終了時刻</FormLabel>
              {renderSelect(
                "inBedEndTime",
                "時刻選択",
                generateTimeOptions(15, 18),
                inBedAlert === "OFF",
              )}
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-x-4">
              <FormLabel>判定時間</FormLabel>
              {renderSelect(
                "inBedJudgeTime",
                "分選択",
                generateMinuteOptions(60, 180),
                inBedAlert === "OFF",
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-2 border-b">
        {/* 心拍アラート */}
        <div className="grid grid-cols-[220px_1fr] items-start gap-2">
          <FormLabel>心拍アラート</FormLabel>
          <div className="space-y-2">
            <div className="grid grid-cols-[80px_1fr] items-center gap-x-4">
              <FormLabel>上限値</FormLabel>
              {renderSelect("heartRateUpperLimit", "BPM", generateThresholdOptions(60, 120))}
            </div>
            <div className="grid grid-cols-[80px_1fr] items-center gap-x-4">
              <FormLabel>下限値</FormLabel>
              {renderSelect("heartRateLowerLimit", "BPM", generateThresholdOptions(40, 60))}
            </div>
            <div className="grid grid-cols-[80px_1fr] items-center gap-x-4">
              <FormLabel>持続時間</FormLabel>
              {renderSelect("heartRateDuration", "分", generateMinuteOptions(1, 60))}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 p-2 border-b">
        {/* 呼吸アラート */}
        <div className="grid grid-cols-[220px_1fr] items-start gap-2">
          <FormLabel>呼吸アラート</FormLabel>
          <div className="space-y-2">
            <div className="grid grid-cols-[80px_1fr] items-center gap-x-4">
              <FormLabel>上限値</FormLabel>
              {renderSelect("respirationUpperLimit", "回/分", generateThresholdOptions(15, 30))}
            </div>
            <div className="grid grid-cols-[80px_1fr] items-center gap-x-4">
              <FormLabel>下限値</FormLabel>
              {renderSelect("respirationLowerLimit", "回/分", generateThresholdOptions(5, 20))}
            </div>
            <div className="grid grid-cols-[80px_1fr] items-center gap-x-4">
              <FormLabel>持続時間</FormLabel>
              {renderSelect("respirationDuration", "分", generateMinuteOptions(1, 60))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-2">
        <div className="grid grid-cols-[220px_1fr] items-center gap-4">
          <FormLabel>センサ感度</FormLabel>
          {renderSelect("sensorSensitivity", "選択", levels)}
        </div>
        <div className="grid grid-cols-[220px_1fr] items-center gap-4">
          <FormLabel>離床判定レベル</FormLabel>
          {renderSelect("bedExitLevel", "選択", levels)}
        </div>
        <div className="grid grid-cols-[220px_1fr] items-center gap-4">
          <FormLabel>臥床判定レベル</FormLabel>
          {renderSelect("inBedLevel", "選択", levels)}
        </div>
      </div>
    </>
  )
}


export const AlertSetting = function AlertSetting({
  uid,
  isAISH,
  form,
}: {
  uid: string,
  isAISH: boolean,
  form: AlertSettingFormInstance;
  onSubmit?: (data: AlertSettingFormValues) => void;
}) {
  const resetConfirmationModal = useModal();
  const saveAlert = useSaveAlertSetting()
  const loginUser = useLoginUser()

  const onUpdate = useCallback(async (data: AlertSettingFormValues) => {
    const result = await saveAlert.mutateAsync({
      uid,
      data: { ...{ CorpID: loginUser.cid, FacilityID: loginUser.fid }, ...transformAlertSettingToApi(data) }
    });

    if (result.status === 200 && result.data.Result) {
      toast("アラート設定を更新しました。");
    } else {
      toast.error("アラート設定の更新に失敗しました:" + result.data.Message);
    }
  }, [saveAlert, uid, loginUser.cid, loginUser.fid])

  const openResetConfirmationModal = resetConfirmationModal.open;
  const onClickReset = useCallback(() => {
    openResetConfirmationModal()
  }, [openResetConfirmationModal,])

  const onReset = useCallback(async () => {
    const result = await saveAlert.mutateAsync({
      uid,
      data: { ...{ CorpID: loginUser.cid, FacilityID: loginUser.fid }, ...transformAlertSettingToApi(alertSettingDefaultValues) }
    });

    if (result.status === 200 && result.data.Result) {
      form.reset(alertSettingDefaultValues);
      toast("アラート設定を初期化しました。");
    } else {
      toast.error("アラート設定の初期化に失敗しました:" + result.data.Message);
    }
  }, [form, saveAlert, uid, loginUser])

  return (
    <>
      <Card className="w-full p-0 mx-auto px-0 border-0 shadow-none gap-2">
        <CardHeader className="px-0 border-0">
          <CardTitle>アラート設定</CardTitle>
        </CardHeader>
        <CardContent className="px-0 border-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-0">
              <AlertSettingFields form={form} isAISH={isAISH} />
              <div className="flex justify-end space-x-2">
                <Button type="submit">更新</Button>
                <Button type="button" variant="outline" onClick={onClickReset}>
                  初期化
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <ConfirmationModal message={<AlertConfirmationMessage />} {...resetConfirmationModal.props} key={resetConfirmationModal.key} onOK={onReset} />
    </>
  );
}
const levels = ["AUTO", "LOW", "HIGH"]

const ConfirmationRow = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
  <div className="grid grid-cols-[100px_80px] items-center gap-x-2 pl-10">
    <div className="text-left">{label}</div>
    <div className="text-right"><span className="text-gray-600 font-bold">{value}</span> {unit && <span className="text-xs">{unit}</span>}</div>
  </div>
)

const AlertConfirmationMessage = () => (
  <div className="space-y-4">
    <div>アラート設定を以下のように初期化します。よろしいですか？</div>
    <div className="space-y-0 text-sm w-[470px] mx-auto">
      <div className="grid grid-cols-[112px_100px_1fr] items-center gap-2 p-2 border-b">
        <div className="text-left">起床アラート</div>
        <div className="text-gray-600 font-bold">OFF</div>
        <div></div>
      </div>
      <div className="grid grid-cols-[112px_100px_1fr] items-start gap-2 p-2 border-b">
        <div className="text-left">離床アラート</div>
        <div className="text-gray-600 font-bold">ON</div>
        <div className="space-y-2">
          <ConfirmationRow label="判定開始時刻" value="20:00" />
          <ConfirmationRow label="判定終了時刻" value="07:00" />
          <ConfirmationRow label="判定時間" value="10" unit="分" />
        </div>
      </div>
      <div className="grid grid-cols-[112px_100px_1fr] items-center gap-2 p-2 border-b">
        <div className="text-left">臥床アラート</div>
        <div className="text-gray-600 font-bold">OFF</div>
        <div></div>
      </div>
      <div className="grid grid-cols-[220px_1fr] items-start gap-2 p-2 border-b">
        <div className="text-left">心拍アラート</div>
        <div className="space-y-2">
          <ConfirmationRow label="上限値" value="100" unit="BPM" />
          <ConfirmationRow label="下限値" value="40" unit="BPM" />
          <ConfirmationRow label="持続時間" value="10" unit="分" />
        </div>
      </div>
      <div className="grid grid-cols-[220px_1fr] items-start gap-2 p-2">
        <div className="text-left">呼吸アラート</div>
        <div className="space-y-2">
          <ConfirmationRow label="上限値" value="30" unit="回/分" />
          <ConfirmationRow label="下限値" value="10" unit="回/分" />
          <ConfirmationRow label="持続時間" value="10" unit="分" />
        </div>
      </div>
    </div>
  </div>
)
