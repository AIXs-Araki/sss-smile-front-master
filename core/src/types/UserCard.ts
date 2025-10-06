export type UserCardData = {
  id: number,
  uid: string,
  groupId: number,
  gender: Gender
  userName: string;
  deviceId: string,
  roomId: number,
  roomNumber: string;
  heartBeat: number | undefined;
  breath: number | undefined;
  bedStatus: BedStatus
  updatedAt: Date;
  isAISH: boolean,
  alertStatus: AlertStatus;
}

export type AlertStatus = "None" | "HeartBeatUpper" | "HeartBeatLower" | "BreathUpper" | "BreathLower" | "Awake" | "InBed" | "BedExit" | "NurseCall" | "SensorOffline" | "NoDevice"
export type BedStatus = "resting" | "moving" | "bedexit" | "offline";
export type Gender = "male" | "female";

/**
 * ユーザーカードの配列を、分割統治のアプローチでソートします。
 *
 * @param cards - ソート対象の UserCardData 配列。
 * @param manualSortOrder - 手動で設定されたカードの ID 配列。
 * @returns ソート済みの新しい UserCardData 配列。
 */
export function sortUserCards(
  cards: UserCardData[],
  manualSortOrder: number[]
): UserCardData[] {
  const manualSortSet = new Set(manualSortOrder);

  const manuallySortedTarget: UserCardData[] = [];
  const remainingCards: UserCardData[] = [];

  for (const card of cards) {
    if (manualSortSet.has(card.id)) {
      manuallySortedTarget.push(card);
    } else {
      remainingCards.push(card);
    }
  }

  const manualOrderMap = new Map<number, number>();
  manualSortOrder.forEach((id, index) => {
    manualOrderMap.set(id, index);
  });

  manuallySortedTarget.sort((a, b) => {
    const indexA = manualOrderMap.get(a.id)!;
    const indexB = manualOrderMap.get(b.id)!;
    return indexA - indexB;
  });

  remainingCards.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));

  return [...manuallySortedTarget, ...remainingCards];
}

export const isAlert = (card: UserCardData) => card.alertStatus !== "None" && card.alertStatus !== "SensorOffline" && card.alertStatus !== "NoDevice";

export const toAlertText = (alertStatus: AlertStatus): string => {
  if (alertStatus === "None") {
    return "";

  } else if (alertStatus === "BedExit") {
    return "離床"
  } else if (alertStatus === "NurseCall") {
    return "呼出"
  } else if (alertStatus === "SensorOffline") {
    return ""
  } else if (alertStatus === "Awake") {
    return "起床"
  } else if (alertStatus === "InBed") {
    return "臥床"
  } else if (alertStatus === "BreathUpper") {
    return "呼吸上限"
  } else if (alertStatus === "BreathLower") {
    return "呼吸下限"
  } else if (alertStatus === "HeartBeatUpper") {
    return "心拍上限"
  } else if (alertStatus === "HeartBeatLower") {
    return "心拍下限"
  } else if (alertStatus === "NoDevice") {
    return ""
  } else {
    return "" as never;
  }
}

export const mapMeasurementStatusToBedStatus = (measurementStatus: string | undefined): BedStatus => {
  switch (measurementStatus) {
    case '1':
    case '10':
      return 'resting';
    case '2':
    case '20':
      return 'moving';
    case '3':
    case '80':
      return 'bedexit';
    case '0':
    case '90':
    default: return 'offline';
  }
}


export const mapAlertStatus = (_alertKind: string | undefined): AlertStatus => {
  if (!_alertKind) {
    return "None"
  }
  const alertKind = Number(_alertKind);
  if (alertKind === 1) {
    return "Awake"
  } else if (alertKind === 2) {
    return "BedExit"
  } else if (alertKind === 3) {
    return "InBed"
  } else if (alertKind === 4) {
    return "HeartBeatUpper"
  } else if (alertKind === 5) {
    return "HeartBeatLower"
  } else if (alertKind === 6) {
    return "BreathUpper"
  } else if (alertKind === 7) {
    return "BreathLower"
  } else if (alertKind === 8) {
    return "NurseCall"
  } else {
    return "None"
  }
}