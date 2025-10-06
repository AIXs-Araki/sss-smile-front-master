import type { BedStatusHistory } from "@core/model/chart.type";
import { useLocation } from "react-router-dom";

export const mergeConsecutiveStatuses = (statuses: BedStatusHistory[]): BedStatusHistory[] => {
  if (statuses.length === 0) return [];

  const merged: BedStatusHistory[] = [];
  let current = { ...statuses[0] };

  for (let i = 1; i < statuses.length; i++) {
    const next = statuses[i];
    if (current.type === next.type) {
      current.endTime = next.endTime;
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  merged.push(current);
  return merged;
};


export const useUserId = () => {
  const location = useLocation();
  const userId = (location.pathname.split('/')[4]);
  return userId;
}

export interface VitalData {
  time: number;
  heartRate?: number | null;
  breath?: number | null;
}
