import { ConfirmationModal } from "@/components/ConfirmationModal";
import { ModalFrame } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { DataDownloadModal } from "@/features/download/DataDownloadScreen";
import { UserGraphModal } from "@/features/graph/UserGraphScreen";
import { PrintModal } from "@/features/print/PrintScreen";
import { useLoginUser } from "@/hooks/useLoginUser";
import type { EditAlertSettingsMonitorBody, GetUserDataApplication200, GetUserDataApplication200AllOfAlertSettings } from "@core/api/api-generated";
import { useModal } from "@core/hooks/useModal";
import { isAlert, type UserCardData } from "@core/types/UserCard";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChartLine, Download, Printer, X } from "lucide-react";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useClearAlert, useSaveAlertSetting, useUserDetail } from "../query";
import { statusImgPath } from "../UserCard";
import AlertBanner from "./AlertBanner";
import { AlertSetting, alertSettingSchema, type AlertSettingFormInstance, type AlertSettingFormValues } from "./AlertSetting";
import ActivityStatusBar from "./parts/ActivityStatusBar";
import { Chart, } from "./parts/Chart";

import { LoadingOverlayFullScreen } from "@/components/LoadingOverlay";
import { renderWhenFetched } from "@/lib/loading";
import { convertToAlerts, convertToChartData } from "@core/model/chartDataConverter";

type RoomModalContext = {
  card: UserCardData | undefined;
};

type UserDetail = GetUserDataApplication200;

const mapApiToFormValues = (alertSettings: GetUserDataApplication200AllOfAlertSettings): AlertSettingFormValues => ({
  wakeUpAlert: alertSettings.Wakeup ? "ON" : "OFF",
  wakeUpTime: alertSettings.WakeupTime || "08:00",
  bedExitAlert: alertSettings.GetoutBed ? "ON" : "OFF",
  bedExitStartTime: alertSettings.GetoutBedTimeFrom || "20:00",
  bedExitEndTime: alertSettings.GetoutBedTimeTo || "07:00",
  bedExitJudgeTime: alertSettings.GetoutBedTimeIntervals?.toString() || "10",
  bedExitLevel: (alertSettings.GetoutBedLevel as "AUTO" | "HIGH" | "MEDIUM" | "LOW") || "AUTO",
  inBedAlert: alertSettings.LieinBed ? "ON" : "OFF",
  inBedStartTime: alertSettings.LieinBedTimeFrom || "09:00",
  inBedEndTime: alertSettings.LieinBedTimeTo || "17:00",
  inBedJudgeTime: alertSettings.LieinBedTimeIntervals?.toString() || "120",
  inBedLevel: (alertSettings.LieinBedLevel as "AUTO" | "HIGH" | "MEDIUM" | "LOW") || "AUTO",
  heartRateUpperLimit: alertSettings.HeartRateLimitUpper || "100",
  heartRateLowerLimit: alertSettings.HeartRateLimitLower || "40",
  heartRateDuration: alertSettings.HeartRateTimeIntervals?.toString() || "10",
  respirationUpperLimit: alertSettings.RespirationRateLimitUpper || "30",
  respirationLowerLimit: alertSettings.RespirationRateLimitLower || "10",
  respirationDuration: alertSettings.RespirationRateTimeIntervals?.toString() || "10",
  sensorSensitivity: (alertSettings.SensorSensitivity as "AUTO" | "HIGH" | "MEDIUM" | "LOW") || "AUTO",
});

export function UserDetailModal() {
  const { card } = useOutletContext<RoomModalContext>();
  const loginUser = useLoginUser();
  const userQuery = useUserDetail(card?.uid?.toString() || "", { CorpID: loginUser.cid, FacilityID: loginUser.fid }, { query: { enabled: !!(card && card.uid) } });

  if (!card) {
    return <LoadingOverlayFullScreen />;
  }

  return renderWhenFetched(userQuery, { width: "100%", height: "100%" }, (userData) => (
    <UserDetailModalContent card={card} user={userData} />
  ));
}

function UserDetailModalContent({ card, user: userData }: { card: UserCardData; user: UserDetail }) {
  const { groupId } = useParams();
  const datadwonloadModal = useModal();
  const printModal = useModal();
  const graphModal = useModal();
  const loginUser = useLoginUser();

  const navigate = useNavigate();
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const clearAlert = useClearAlert();
  const saveAlertSettings = useSaveAlertSetting();

  const form = useForm<AlertSettingFormValues>({
    resolver: zodResolver(alertSettingSchema),
    defaultValues: mapApiToFormValues(userData.AlertSettings!),
  });

  const close = useCallback(() => {
    navigate(`/monitor/${groupId}`);
  }, [navigate, groupId]);

  const save = useCallback(async (data: AlertSettingFormValues) => {
    const formValues = mapFormToApiBody(loginUser.cid, loginUser.fid, data);
    const result = await saveAlertSettings.mutateAsync({ uid: card?.uid || "", data: formValues });
    if (result.status !== 200 || !result.data.Result) {
      // TODO error
    } else {
      // TODO 
    }
  }, [card?.uid, loginUser.cid, loginUser.fid, saveAlertSettings]);


  const frameClass = twMerge("sm:max-w-7xl", card.alertStatus === "None" ? "" : "border-4 border-red-400 rounded-3xl bg-white")
  const onClearAlert = async () => {
    const result = await clearAlert.mutateAsync({
      uid: card.uid, data: {
        CorpID: loginUser.cid,
        FacilityID: loginUser.fid,
        DeviceID: card.deviceId,
        RoomID: card.roomId,
      }
    });
    if (result.status === 200 && result.data.Result) {
      // TODO refresh cards
      card.alertStatus = "None";
      close()
    } else {
      // TODO show error message
    }
  }
  if (!card) {
    console.error("no data", card);
    return <>no data</>
  }

  const handleClose = () => {
    if (form.formState.isDirty) {
      setConfirmationOpen(true);
    } else {
      close();
    }
  };

  const handleConfirmSave = async () => {
    await form.handleSubmit(save)();
    setConfirmationOpen(false);
    close();
  };

  const handleConfirmCancel = () => {
    setConfirmationOpen(false);
    close();
  };

  return (
    <>
      <ModalFrame opened={true} close={handleClose} maskClosable={true} className={frameClass} rounded={card.alertStatus === "None"}>
        <div className="flex gap-2 bg-white overflow-y-scroll hide-scrollbar rounded-3xl" style={{ maxHeight: "calc( 100vh - 80px )" }}>
          <div className="w-3/5 border-r border-gray-300">
            <Left card={card} user={userData} close={handleClose}
              clearAlert={onClearAlert}
              openDownloadModal={datadwonloadModal.open}
              openPrintModal={printModal.open}
              openGraphModal={graphModal.open}
            />
          </div >
          <div className="w-2/5 h-full">
            <Right card={card} user={userData} form={form} onSubmit={save} />
          </div>
        </div >
      </ModalFrame >
      <ConfirmationModal
        open={isConfirmationOpen}
        close={() => setConfirmationOpen(false)}
        message="変更が保存されていません。保存して閉じますか？"
        okLabel="保存して閉じる"
        cancelLabel="保存せずに閉じる"
        onOK={handleConfirmSave}
        onCancel={handleConfirmCancel}
      />
      <DataDownloadModal {...datadwonloadModal.props} key={datadwonloadModal.key} card={card} />
      <PrintModal {...printModal.props} key={printModal.key} card={card} />
      <UserGraphModal {...graphModal.props} key={graphModal.key} card={card} />
    </>
  )

}


const Left = (props: { card: UserCardData, user: UserDetail, close: () => void, clearAlert: () => void, openDownloadModal: () => void, openPrintModal: () => void, openGraphModal: () => void }) => {
  const card = props.card;

  const { statuses, alerts } = useMemo(
    () => convertToAlerts(props.user.MeasurementStatusSummary || []),
    [props.user.MeasurementStatusSummary]
  );
  console.log(statuses, alerts)
  return <>
    <div className="bg-white px-4 pt-5 pb-0 sm:p-6 sm:pb-0">

      <div className="flex w-full">
        <div className="flex flex-col" style={{ paddingLeft: 60, width: "84%" }}>
          <div className="shrink">
            <Names card={card} />
          </div>
          <div className="mx-auto flex grow gap-8 ">
            <div>
              <Vitals card={card} />
            </div>
            <div>
              <StatusImage card={card} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 justify-around" style={{ width: "16%" }}>
          <Button variant={"outline"} onClick={props.close} ><X />閉じる</Button>
          <div>

            {isAlert(card) &&
              <AlertBanner alertStatus={card.alertStatus} onDismiss={() => { props.clearAlert() }} />
            }
          </div>
        </div>
      </div>

      <div className="pt-2 text-center flex flex-col">

        <div className=" flex flex-col">
          <ActivityStatusBar
            statuses={statuses}
            currentTime={new Date()}
            showTimeMarkers={true}
            alert={alerts}
          />
          <HeartRateChart user={props.user} />
          <RespirationChart user={props.user} />
        </div>
      </div>    </div>
    <div className="bg-gray-50 px-4 py-0 sm:px-6 flex justify-end">
      <div className="flex gap-1.5">
        <Button variant={"outline"} onClick={props.openGraphModal}><ChartLine />グラフ一覧</Button>
        <Button variant={"outline"} onClick={props.openDownloadModal}><Download />データダウンロード</Button>
        <Button variant={"outline"} onClick={props.openPrintModal}><Printer />印刷</Button>
      </div>
    </div>
  </>
}

const Right = (props: { card: UserCardData, user: UserDetail, form: AlertSettingFormInstance, onSubmit: (data: AlertSettingFormValues) => void }) => {
  return <>
    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <AlertSetting uid={props.card.uid} form={props.form} onSubmit={props.onSubmit} isAISH={props.card.isAISH} />
    </div>
  </>
}

export function ModalHeader(props: PropsWithChildren<{ close: () => void }>) {
  return <div className="bg-white px-4 py-3 sm:px-6 flex flex-row">

    <button type="button"
      className="btn-close box-content p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline h-6 w-6"
      data-bs-dismiss="modal" aria-label="Close" onClick={props.close}><X /></button>
  </div >
}



const Names = (props: { card: UserCardData }) => {
  const card = props.card;
  return <div className="text-left font-bold flex items-end gap-4">
    <div className="text-sm" style={{ fontSize: 28 }}>{card.roomNumber}</div>
    <div className={twMerge("text-xl truncate")} style={{ fontSize: 32 }}>{card.userName}</div>
  </div>
}

const Vitals = (props: { card: UserCardData }) => {
  const fontSize = 44
  return <div className={twMerge("flex  items-baseline  space-x-1 pl-28  mx-auto  gap-4")}>
    <div className="">
      <div className="items-baseline text-right" >
        <span className="text-4xl font-bold text-red-600" style={{ fontSize }}>{props.card.heartBeat ?? '--'}</span>
      </div>
    </div>
    <div className="text-center">
      <div className="items-baseline text-right" >
        <span className="text-4xl font-bold text-blue-600" style={{ fontSize }}>{props.card.breath ?? '--'}</span>
      </div>
    </div>
  </div>
}

const HeartRateChart = (props: { user: UserDetail, }) => {
  const heartRateData = convertToChartData(props.user.HeartRateSummary || [])
  const heartRateConfig = {
    title: '心拍',
    unit: 'bpm',
    lineColor: '#ef4444', // red-500
    defaultMaxY: 200,
    abnormalRanges: {
      high: { threshold: 120, color: 'rgba(239, 68, 68, 0.1)', label: '頻脈' },
      low: { threshold: 40, color: 'rgba(239, 68, 68, 0.1)', label: '徐脈' },
    },
  };

  return <Chart data={heartRateData} {...heartRateConfig} />;
};


/**
 * 呼吸グラフ専用コンポーネント
 */
const RespirationChart = (props: { user: UserDetail, }) => {
  const respirationData = convertToChartData(props.user.RespirationRateSummary || [])
  // 呼吸グラフ用のデータと設定
  const respirationConfig = {
    title: '呼吸',
    unit: '回/分',
    lineColor: '#3b82f6', // blue-500
    defaultMaxY: 40,
    abnormalRanges: {
      high: { threshold: 30, color: 'rgba(59, 130, 246, 0.1)', label: '頻呼吸' },
      low: { threshold: 10, color: 'rgba(59, 130, 246, 0.1)', label: '徐呼吸' },
    },
  };

  return <Chart data={respirationData} {...respirationConfig} />;
}

const StatusImage = (props: { card: { isAISH: boolean, gender: "male" | "female", bedStatus: "bedexit" | "resting" | "moving" | "offline" } }) => {
  const card = props.card;

  const className = twMerge("w-full h-full object-contain")

  return <div className="h-full w-full flex items-end">
    <div className="flex items-end  relative mx-auto" style={{
      width: "90%", height: "90%"
    }}>
      <img src={`/${statusImgPath(card.gender, card.bedStatus, 8)}`} style={{ maxWidth: 160, maxHeight: 46 }} className={twMerge("border-2 border-white", className)} />

      {props.card.isAISH &&
        <div className="absolute font-extralight text-grah-900 stroked-text" style={{ bottom: 0, right: -8, fontSize: 18 }}>
          AISH
        </div>
      }
    </div>
  </div>
}




const mapFormToApiBody = (cid: number, fid: string, data: AlertSettingFormValues): EditAlertSettingsMonitorBody => ({
  CorpID: cid,
  FacilityID: fid,
  Wakeup: data.wakeUpAlert === "ON",
  WakeupTime: data.wakeUpTime,
  GetoutBed: data.bedExitAlert === "ON",
  GetoutBedTimeFrom: data.bedExitStartTime,
  GetoutBedTimeTo: data.bedExitEndTime,
  GetoutBedTimeIntervals: data.bedExitJudgeTime ? parseInt(data.bedExitJudgeTime) : undefined,
  GetoutBedLevel: data.bedExitLevel,
  LieinBed: data.inBedAlert === "ON",
  LieinBedTimeFrom: data.inBedStartTime,
  LieinBedTimeTo: data.inBedEndTime,
  LieinBedTimeIntervals: data.inBedJudgeTime ? parseInt(data.inBedJudgeTime) : undefined,
  LieinBedLevel: data.inBedLevel,
  HeartRateLimitUpper: data.heartRateUpperLimit === "OFF" ? undefined : data.heartRateUpperLimit,
  HeartRateLimitLower: data.heartRateLowerLimit === "OFF" ? undefined : data.heartRateLowerLimit,
  HeartRateTimeIntervals: parseInt(data.heartRateDuration),
  RespirationRateLimitUpper: data.respirationUpperLimit === "OFF" ? undefined : data.respirationUpperLimit,
  RespirationRateLimitLower: data.respirationLowerLimit === "OFF" ? undefined : data.respirationLowerLimit,
  RespirationRateTimeIntervals: parseInt(data.respirationDuration),
  SensorSensitivity: data.sensorSensitivity,
});