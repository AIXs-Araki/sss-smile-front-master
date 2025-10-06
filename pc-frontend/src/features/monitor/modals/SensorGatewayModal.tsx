import { ClosableModal, type ClosableModalProps } from "@/components/Modal";
import { AlertCircle, Check, X } from "lucide-react";
import { useSensorStatus } from "../query";
import { useLoginUser } from "@/hooks/useLoginUser";
import type { GetSensorGatewayConditionMonitor200AllOfDataListItem } from "@core/api/api-generated";


type Sensor = {
  id: number,
  hostName: string,
  version: string,
  machineType: "windows" | "dedicated"
  status: "normal" | "error"
}

type Props = {
} & Omit<ClosableModalProps, "title">

export function SensorGateWayModal(props: Props) {
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
  const updatdTime = sensorStatus.data?.data.UpdatedTime || ""
  const { sensors: data, hasError } = convertToSensorData(sensorStatus.data?.data.DataList);
  return <div>
    <ClosableModal
      {...props}
      title={"センサーゲートウェイ機器の状態"}
      renderButtons={() => {
        return <></>
      }}
    >
      <div className="flex flex-col">
        {(!!sensorStatus.error) && (
          <div className="mb-4 p-4 border border-red-500 bg-red-50 mx-4 rounded-lg">
            <div className="flex gap-4">
              <div className="text-red-500 flex items-center">
                <AlertCircle />
              </div>
              <div className="grow text-sm font-medium text-red-700">
                センサーゲートウェイ機器の状態を取得できません
              </div>
            </div>
          </div>
        )}

        <div className=" bg-white">

          <div className="overflow-x-auto">
            <div className="w-full inline-block align-middle">
              <div className="border overflow-hidden rounded-lg w-full">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr >
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ width: 111 }}
                      >
                        ホスト名
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ width: 111 }}
                      >
                        バージョン
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ width: 111 }}
                      >
                        機器タイプ
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ width: 111 }}
                      >
                        状態
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.length > 0 ? (
                      data.map(row => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                          >
                            {row.hostName}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                          >
                            {row.version}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                          >
                            {row.machineType === "windows" && <span className="">Windows</span>}
                            {row.machineType === "dedicated" && <span className="">専用機</span>}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                          >
                            {row.status === "normal" && <span className="text-blue-500"><Check className="inline w-4 h-4 mr-1" />正常</span>}
                            {row.status === "error" && <span className="text-red-500"><X className="inline w-4 h-4 mr-1" />異常</span>}
                          </td>

                        </tr>
                      ))
                    ) : (
                      // アラートがない場合の表示
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-10 text-sm text-gray-500"
                        >
                          センサーデータがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {hasError && <div className="my-4 p-4 border border-red-500 bg-red-50 mx-4 rounded-lg">
          <div className="flex gap-4">
            <div className="text-red-500 flex items-center">
              <AlertCircle />
            </div>
            <div className="grow text-sm">
              センサーゲートウェイが正しく動いていない可能性があります｡次の項目をご確認ください｡
              <ul className="pl-12 py-2 list-disc">
                <li className="p-1">センサーゲートウェイ機器､またはセンサーゲートウェイ機器と繋がっているネットワーク機器の電源が切れていませんか?</li>
                <li className="p-1">センサーゲートウェイ機器､またはセンサーゲートウェイ機器と繋がっているネットワーク機器のLANケーブルが抜けていませんか?</li>
                <li className="p-1">(Windows PCの場合) センサーゲートウェイ用アプリが終了されていませんか?</li>
                <li className="p-1">(Windows PCの場合) PCがスリープ状態になっていませんか?</li>
                <li className="p-1">(Windows PCの場合) Windows Updateが実行されていますか?</li>
                <li className="p-1">(Windows PCの場合) PCで他のアプリを使用していませんか?</li>
              </ul>
              問題がなければ､センサーゲートウェイ機器の電源をお切りいただき､再度電源を入れて下さい｡それでも解消されない場合は､お手数ですが販売店または代理店へのご連絡をお願いします｡
            </div>
          </div>
        </div>}


        <div className="flex flex-row w-full justify-end pt-4 text-xs">
          <div>
            最終計測日時: {updatdTime}
          </div>
        </div>
      </div >
    </ClosableModal>
  </div>
}

function convertToSensorData(DataList: GetSensorGatewayConditionMonitor200AllOfDataListItem[] | undefined): { sensors: Sensor[], hasError: boolean } {
  if (!DataList) return { sensors: [], hasError: false };

  let hasError = false;
  const sensors = DataList.map((item, index) => {
    const isError = item.GatewayStatus === "1";
    if (isError) hasError = true;

    return {
      id: index + 1,
      hostName: item.GatewayName || "",
      version: item.Version || "",
      machineType: item.MachineType === "1" ? "windows" as const : "dedicated" as const,
      status: isError ? "error" : "normal" as "normal" | "error"
    };
  });
  return { sensors, hasError };
}

