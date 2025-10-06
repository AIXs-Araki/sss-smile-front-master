import { BedStatus } from "../types/UserCard";

// グラフの各データポイントの型定義
export interface DataPoint {
  time: string;
  value: number | null;
}

// アラートオブジェクトのインターフェースを定義
export interface BedStatusHistory {
  id: string | number;
  startTime: Date;
  endTime: Date;
  type: BedStatus;
}

