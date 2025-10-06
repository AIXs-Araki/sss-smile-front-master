import { GetUserDataMatrixApplication200AllOfDataListItem } from "../api/api-generated";
import { mapAlertStatus, mapMeasurementStatusToBedStatus, UserCardData } from "../types/UserCard";

export const convertToUserCards = (dataList: GetUserDataMatrixApplication200AllOfDataListItem[], groupId: number, updatedAt: Date): UserCardData[] => {
  return dataList.map((item, index) => ({
    id: item.RoomID || index,
    uid: item.UserID || "",
    groupId: groupId,
    gender: item.Gender === "男" ? "male" : "female",
    userName: item.UserName || "",
    roomId: item.RoomID || 0,
    deviceId: item.DeviceID || "",
    roomNumber: item.RoomNumber || "",
    heartBeat: item.HeartRate,
    breath: item.RespirationRate,
    bedStatus: mapMeasurementStatusToBedStatus((item.MeasurementStatus)), // TODO: MeasurementStatusから適切に変換
    alertStatus: mapAlertStatus((item.AlertKinds)), // TODO: AlertKindsから適切に変換
    updatedAt: updatedAt,
    isAISH: item.DeviceType === 2, // TODO: 適切な値を設定
  }));
};