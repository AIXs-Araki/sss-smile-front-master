

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { ClosableModal, type ClosableModalProps } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserHeaderForModal } from "@/components/UserHeader";
import { cn } from "@/lib/utils";

import { ja } from 'date-fns/locale';
import type { User } from "../management/users/UsersScreen";
import { useGraphForDownload } from "./query";
import { useGraphTimeFormat } from "../print/query";
import type { UserCardData } from "@core/types/UserCard";


type Props = {
  /** 退去済みかどうか */
  user?: User,
  card?: UserCardData
} & Omit<ClosableModalProps, "title">


export const DataDownloadModal = (props: Props) => {


  return <div>
    <ClosableModal
      {...props}
      title={"データダウンロード"}
      renderButtons={() => {
        return <div className="flex gap-2">
        </div>
      }}
    >
      <div className="p-6 text-center flex flex-col">

        <UserHeaderForModal isLeft={props.user?.status === "OUT"} card={props.card} />
        <div className="flex-grow w-full flex gap-4" style={{}}>
          <div className="flex flex-col gap-4 mx-auto " style={{}}>
            <div className="mx-auto">
              <ReportDownloader user={props.user} />
            </div>
          </div>
        </div>


      </div>
    </ClosableModal>
  </div>
};


export function ReportDownloader(props: { user?: User }) {
  const query = useGraphForDownload();

  // --- 状態管理 ---
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [endTime, setEndTime] = useState<string>("00:00");
  const [isError, setIsError] = useState<boolean>(false);

  // --- バリデーションロジック ---
  useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      // 日付と時間を結合してDateオブジェクトを生成
      const startDateTime = new Date(
        `${format(startDate, "yyyy-MM-dd")}T${startTime}`
      );
      const endDateTime = new Date(
        `${format(endDate, "yyyy-MM-dd")}T${endTime}`
      );

      // 終了日時が開始日時より前ならエラー状態にする
      if (endDateTime < startDateTime) {
        setIsError(true);
      } else {
        setIsError(false);
      }
    }
  }, [startDate, startTime, endDate, endTime]);

  // --- イベントハンドラ ---
  const handleDownload = async () => {
    if (isError || !startDate || !endDate) return;

    const startDateTime = new Date(`${format(startDate, "yyyy-MM-dd")}T${startTime}`);
    const endDateTime = new Date(`${format(endDate, "yyyy-MM-dd")}T${endTime}`);

    try {
      // TODO: 実際のuid, cid, fidを取得
      const data = await download(query, "uid", 1, "fid", startDateTime, endDateTime);

      if (!data) return;

      // CSV最初の2行
      const infoRows = [
        ["個人コード", props.user?.id || ""],
        ["状態", "10:安静, 20:体動, 80:離床"]
      ];

      // CSVヘッダ（3行目）
      const headers = ["日時", "状態", "心拍", "呼吸"];

      // CSVデータ行
      const rows = data.map(item => [
        item.Time || "",
        item.MeasurementStatus || "",
        item.HeartRateValue?.toString() || "",
        item.RespirationRateValue?.toString() || ""
      ]);

      // CSV文字列生成
      const csvContent = [...infoRows, headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(","))
        .join("\n");

      // ダウンロード実行
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${props.user?.id}_${format(new Date(), "yyyyMMddHHmm")}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed:", error);
      alert("ダウンロードに失敗しました。");
    }
  };

  // --- レンダリング ---
  return (
    <Card className=" border-none rounded-none shadow-none">
      <CardContent className="grid gap-6">
        {/* 開始日時セクション */}
        <div className="grid gap-2 mx-auto">
          <Label htmlFor="start-date">開始日時</Label>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "yyyy/MM/dd") : <span>日付を選択</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  locale={ja}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-[120px]"
            />
          </div>
        </div>

        {/* 終了日時セクション */}
        <div className="grid gap-2 mx-auto">
          <Label htmlFor="end-date">終了日時</Label>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "yyyy/MM/dd") : <span>日付を選択</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-[120px]"
            />
          </div>
        </div>

        {/* エラーメッセージ */}
        {isError && (
          <p className="text-sm font-medium text-destructive">
            終了日時は開始日時より後に設定してください。
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 pt-8">
        {/* ダウンロードボタン */}
        <Button onClick={handleDownload} disabled={isError} className="w-48 mx-auto">
          ダウンロード
        </Button>
        {/* 注意書き */}
        <p className="text-xs text-muted-foreground">
          ※指定した期間が長すぎると、時間がかかるもしくはダウンロードできない場合があります。
        </p>
      </CardFooter>
    </Card>
  );
}

async function download(query: ReturnType<typeof useGraphForDownload>, uid: string, cid: number, fid: string, start: Date, end: Date) {
  const startYMDHMS = format(start, useGraphTimeFormat);
  const endYMDHMS = format(end, useGraphTimeFormat);

  const result = await query.mutateAsync({ uid: uid, params: { CorpID: cid, FacilityID: fid, Start: startYMDHMS, End: endYMDHMS } });
  return result.data.SummaryDataList;
}