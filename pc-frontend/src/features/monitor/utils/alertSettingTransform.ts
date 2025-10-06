import type { AlertSettingFormValues } from "../modals/AlertSetting";

export function transformAlertSettingToApi(data: Partial<AlertSettingFormValues>) {
  return {
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
    HeartRateLimitUpper: data.heartRateUpperLimit,
    HeartRateLimitLower: data.heartRateLowerLimit,
    HeartRateTimeIntervals: data.heartRateDuration ? parseInt(data.heartRateDuration) : undefined,
    RespirationRateLimitUpper: data.respirationUpperLimit,
    RespirationRateLimitLower: data.respirationLowerLimit,
    RespirationRateTimeIntervals: data.respirationDuration ? parseInt(data.respirationDuration) : undefined,
    SensorSensitivity: data.sensorSensitivity,
  };
}