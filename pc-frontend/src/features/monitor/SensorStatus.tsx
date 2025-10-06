import { Button } from "@/components/ui/button";
import { twMerge } from "tailwind-merge";
import { useSensorStatus } from "./query";
import { useLoginUser } from "@/hooks/useLoginUser";
import type { GetSensorGatewayConditionMonitor200AllOfDataListItem } from "@core/api/api-generated";

type Props = {
  alert: boolean;
  onOpenSensor: () => void;
}

export const SensorStatus = (props: Props) => {
  const user = useLoginUser();
  const sensorStatus = useSensorStatus({ CorpID: user.cid, FacilityID: user.fid }, {
    query: {
      // 1. 1分おきにクエリを自動実行する
      refetchInterval: 60 * 1000,
      // 2. 取得に失敗した場合、1回だけリトライする
      retry: 1,
      // 3. リトライする前に5秒待つ
      retryDelay: 0,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false
    }
  });

  const isAlert = (!!sensorStatus.error) || isSensorAlert(sensorStatus.data?.data.DataList || [])

  const className = twMerge([
    " transition-colors",
    isAlert ? "bg-red-500 hover:bg-red-500/90 text-white animate-flash-strong" : ""
  ])
  const text = isAlert ? "センサーゲートウェイ機器の異常" : "センサーゲートウェイ機器の確認"

  return <div>
    <Button className={className} onClick={props.onOpenSensor} >{text}</Button>
  </div>
}


function isSensorAlert(devices: GetSensorGatewayConditionMonitor200AllOfDataListItem[]) {
  return devices.some((d) => {
    return d.GatewayStatus === "1"
  });
}