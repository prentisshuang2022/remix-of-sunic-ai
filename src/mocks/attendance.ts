/**
 * 考勤助手模块 Mock 数据
 * [BACKEND] 所有数据将由后端 API 提供
 */

// ========== 类型定义 ==========

export type ExceptionType = "迟到" | "早退" | "缺卡" | "旷工";
export type ExceptionStatus = "pending" | "notified" | "employee-done" | "notified-no-response";
export type Campus = "武汉总部" | "鄂州工厂";
export type PositionType = "生产岗" | "质检岗" | "销售岗" | "行政岗" | "研发岗";

export type DayStatus = "normal" | "late" | "overtime" | "leave" | "dayoff" | "weekend";
export type LeaveType = "事假" | "病假" | "年假";
export type AnomalyProcessStatus = "未通知" | "已通知" | "员工已处理" | "已通知未处理";

export interface ExceptionRow {
  id: string;
  name: string;
  dept: string;
  position: string;
  group: string;
  clockIn: string;
  clockOut: string;
  type: ExceptionType;
  aiSuggestion: string;
  status: ExceptionStatus;
}

export interface AccessRecord {
  time: string;
  direction: "入厂" | "出厂" | "出门" | "入门";
  gate: string;
  method: "门禁卡" | "刷脸";
  cardNo?: string;
}

export interface DayCell {
  day: number;
  weekday: number; // 0=Sun 6=Sat
  status: DayStatus;
  scheduledIn?: string;
  scheduledOut?: string;
  clockIn?: string;
  clockOut?: string;
  workHours?: number;
  aiTip?: string;
  leaveType?: LeaveType;
  anomalyMinutes?: number;
  accessRecords?: AccessRecord[];
  hasAccessEvidence?: boolean;
}

export interface AnomalyRecord {
  day: number;
  weekdayLabel: string;
  type: string;
  description: string;
  processStatus: AnomalyProcessStatus;
  notifiedAt?: string;
  aiSuggestion: string;
  evidence?: string;
  accessRecordCount?: number;
}

export interface OvertimeTimelineEntry {
  day: number;
  type: "overtime" | "dayoff";
  hours: number;
  description: string;
  linkedDay?: number;
  canApply?: boolean;
  hasAccessEvidence?: boolean;
}

export interface EmployeeStats {
  attendanceDays: number;
  totalDays: number;
  totalWorkHours: number;
  anomalyCount: number;
  overtimeHours: number;
  pendingCount: number;
}

export interface HeatmapEmployee {
  id: string;
  name: string;
  campus: Campus;
  positionType: PositionType;
  anomalyCount: number;
  avatarColor: string;
  days: DayCell[];
  employeeNo: string;
  hireDate: string;
  supervisor: string;
  dingId: string;
  accessCardNo: string;
  dept: string;
  stats: EmployeeStats;
  anomalies: AnomalyRecord[];
  timeline: OvertimeTimelineEntry[];
}

export interface OvertimeRow {
  id: string;
  name: string;
  dept: string;
  position: string;
  group: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  hours: number;
  canDayoff: number;
  subsidy: number;
  remark: string;
}

export interface DayoffRow {
  id: string;
  name: string;
  dept: string;
  totalHours: number;
  usedHours: number;
  remainHours: number;
  lastUsedDate: string;
}

export interface AttendanceRule {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  category: string;
  name: string;
  description: string;
  enabled: boolean;
}

// ========== Helper: April 2026 weekday lookup ==========
function aprilWeekday(day: number): number {
  return new Date(2026, 3, day).getDay();
}

function isWeekend(day: number): boolean {
  const wd = aprilWeekday(day);
  return wd === 0 || wd === 6;
}

const weekdayLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

// ========== Access record generators ==========

function generateAccessRecords(day: number, clockIn?: string, clockOut?: string, status?: DayStatus, campus?: Campus): AccessRecord[] {
  if (status === "weekend") return [];
  if (status === "leave" || status === "dayoff") return [];
  const gate = campus === "鄂州工厂" ? "正门" : "大楼正门";
  const cardNo = "#" + (1000 + Math.floor(Math.random() * 100));
  const records: AccessRecord[] = [];

  // Morning entry - often earlier than clock-in
  if (clockIn && clockIn !== "—") {
    const [h, m] = clockIn.split(":").map(Number);
    const earlyMin = Math.floor(Math.random() * 45) + 5; // 5-50 min earlier
    const entryH = h - Math.floor((m - earlyMin + 60) / 60 - 1);
    const entryM = ((m - earlyMin) % 60 + 60) % 60;
    const entryTime = `${String(Math.max(7, entryH)).padStart(2, "0")}:${String(entryM).padStart(2, "0")}`;
    records.push({ time: entryTime, direction: "入厂", gate, method: "门禁卡", cardNo });
  }

  // Lunch
  if (Math.random() > 0.4) {
    records.push({ time: "12:05", direction: "出门", gate: "食堂", method: "刷脸" });
    records.push({ time: "12:48", direction: "入厂", gate, method: "门禁卡", cardNo });
  }

  // Evening exit
  if (clockOut && clockOut !== "—") {
    const [h, m] = clockOut.split(":").map(Number);
    const lateMin = Math.floor(Math.random() * 20) + 5;
    const exitTime = `${String(h).padStart(2, "0")}:${String(Math.min(59, m + lateMin)).padStart(2, "0")}`;
    records.push({ time: exitTime, direction: "出厂", gate, method: "门禁卡", cardNo });
  }

  return records;
}

// ========== Deterministic employee day data ==========

interface DaySpec {
  day: number;
  status: DayStatus;
  clockIn?: string;
  clockOut?: string;
  aiTip?: string;
  leaveType?: LeaveType;
  anomalyMinutes?: number;
  accessOverride?: AccessRecord[];
}

function buildDays(specs: DaySpec[], campus: Campus): DayCell[] {
  const specMap = new Map(specs.map(s => [s.day, s]));
  const days: DayCell[] = [];
  for (let d = 1; d <= 30; d++) {
    const wd = aprilWeekday(d);
    const spec = specMap.get(d);
    if (spec) {
      const accessRecords = spec.accessOverride || generateAccessRecords(d, spec.clockIn, spec.clockOut, spec.status, campus);
      const hasAccessEvidence = spec.status === "late" && accessRecords.length > 0 && accessRecords[0]?.time < (spec.clockIn || "");
      days.push({
        day: d,
        weekday: wd,
        status: spec.status,
        scheduledIn: isWeekend(d) ? undefined : "09:00",
        scheduledOut: isWeekend(d) ? undefined : "18:00",
        clockIn: spec.clockIn,
        clockOut: spec.clockOut,
        workHours: spec.status === "leave" || spec.status === "weekend" ? 0 :
          spec.status === "dayoff" ? 0 :
          spec.clockIn && spec.clockOut && spec.clockOut !== "—" && spec.clockIn !== "—"
            ? Math.round((parseFloat(spec.clockOut.split(":")[0]) + parseFloat(spec.clockOut.split(":")[1]) / 60
              - parseFloat(spec.clockIn.split(":")[0]) - parseFloat(spec.clockIn.split(":")[1]) / 60) * 10) / 10
            : 0,
        aiTip: spec.aiTip,
        leaveType: spec.leaveType,
        anomalyMinutes: spec.anomalyMinutes,
        accessRecords,
        hasAccessEvidence,
      });
    } else if (isWeekend(d)) {
      days.push({ day: d, weekday: wd, status: "weekend" });
    } else {
      const clockIn = "08:55";
      const clockOut = "18:05";
      const accessRecords = generateAccessRecords(d, clockIn, clockOut, "normal", campus);
      days.push({
        day: d, weekday: wd, status: "normal",
        scheduledIn: "09:00", scheduledOut: "18:00",
        clockIn, clockOut, workHours: 9.2,
        accessRecords,
      });
    }
  }
  return days;
}

function buildAnomalies(days: DayCell[]): AnomalyRecord[] {
  const anomalies: AnomalyRecord[] = [];
  const statuses: AnomalyProcessStatus[] = ["未通知", "已通知", "员工已处理", "已通知未处理"];
  let i = 0;
  for (const d of days) {
    if (d.status === "late" || d.status === "leave") {
      const ps = statuses[i % 4];
      i++;
      const type = d.status === "late" ? (d.anomalyMinutes ? `迟到 ${d.anomalyMinutes} 分钟` : "迟到") :
        d.leaveType ? `${d.leaveType}` : "请假";
      const desc = d.status === "late"
        ? `上班打卡 ${d.clockIn}，迟到 ${d.anomalyMinutes || 0} 分钟`
        : `${d.leaveType || "事假"}一天`;

      const accessFirst = d.accessRecords?.[0];
      let aiSuggestion = "";
      let evidence = "";
      const accessCount = d.accessRecords?.length || 0;

      if (d.status === "late" && d.hasAccessEvidence && accessFirst) {
        aiSuggestion = `疑似漏打卡，门禁 ${accessFirst.time} 已有入厂记录，建议通知员工补卡`;
        evidence = `门禁记录 ${accessFirst.time} 入厂`;
      } else if (d.status === "late") {
        aiSuggestion = "无关联门禁记录，建议通知员工说明情况";
      } else if (d.status === "leave") {
        aiSuggestion = "存在请假审批记录，等待钉钉数据回流确认";
      }

      anomalies.push({
        day: d.day,
        weekdayLabel: weekdayLabels[d.weekday],
        type, description: desc,
        processStatus: ps,
        notifiedAt: ps === "已通知" ? "3小时前" : ps === "已通知未处理" ? "2天前" : undefined,
        aiSuggestion,
        evidence,
        accessRecordCount: accessCount > 0 ? accessCount : undefined,
      });
    }
  }
  return anomalies;
}

function buildTimeline(days: DayCell[]): OvertimeTimelineEntry[] {
  const entries: OvertimeTimelineEntry[] = [];
  const overtimeDays = days.filter(d => d.status === "overtime");
  const dayoffDays = days.filter(d => d.status === "dayoff");

  for (const ot of overtimeDays) {
    const hours = ot.workHours || 4;
    const linked = dayoffDays.find(df => df.day > ot.day);
    const hasGateEvidence = (ot.accessRecords?.length || 0) > 0;
    entries.push({
      day: ot.day, type: "overtime", hours,
      description: isWeekend(ot.day) ? `周末加班 ${hours}h` : `工作日加班 ${hours}h`,
      linkedDay: linked?.day,
      canApply: !linked,
      hasAccessEvidence: hasGateEvidence,
    });
  }
  for (const df of dayoffDays) {
    const linked = overtimeDays.find(ot => ot.day < df.day);
    entries.push({
      day: df.day, type: "dayoff", hours: 4,
      description: `使用调休 4h`, linkedDay: linked?.day,
    });
  }
  return entries.sort((a, b) => a.day - b.day);
}

function buildStats(days: DayCell[], anomalyCount: number): EmployeeStats {
  const attendanceDays = days.filter(d => d.status === "normal" || d.status === "late" || d.status === "overtime").length;
  const totalWorkHours = days.reduce((sum, d) => sum + (d.workHours || 0), 0);
  const overtimeHours = days.filter(d => d.status === "overtime").reduce((sum, d) => sum + (d.workHours || 0), 0);
  const pendingCount = Math.min(3, Math.ceil(anomalyCount / 2));
  return { attendanceDays, totalDays: 30, totalWorkHours: Math.round(totalWorkHours), anomalyCount, overtimeHours: Math.round(overtimeHours), pendingCount };
}

// ========== 7 employees with deterministic data ==========

const zhangSanSpecs: DaySpec[] = [
  { day: 2, status: "late", clockIn: "09:35", clockOut: "18:30", aiTip: "疑似漏打卡，门禁 08:58 已入厂", anomalyMinutes: 35,
    accessOverride: [
      { time: "08:58", direction: "入厂", gate: "正门", method: "门禁卡", cardNo: "#1042" },
      { time: "12:05", direction: "出门", gate: "食堂", method: "刷脸" },
      { time: "12:48", direction: "入厂", gate: "正门", method: "门禁卡", cardNo: "#1042" },
      { time: "18:45", direction: "出厂", gate: "正门", method: "门禁卡", cardNo: "#1042" },
    ] },
  { day: 4, status: "overtime", clockIn: "09:00", clockOut: "21:00", aiTip: "周末加班，门禁 08:50-21:30" },
  { day: 5, status: "overtime", clockIn: "09:00", clockOut: "17:00", aiTip: "周末加班4h" },
  { day: 7, status: "late", clockIn: "09:20", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 09:05 入厂", anomalyMinutes: 20,
    accessOverride: [
      { time: "09:05", direction: "入厂", gate: "正门", method: "门禁卡", cardNo: "#1042" },
      { time: "18:25", direction: "出厂", gate: "正门", method: "门禁卡", cardNo: "#1042" },
    ] },
  { day: 10, status: "leave", clockIn: "—", clockOut: "—", aiTip: "事假一天", leaveType: "事假" },
  { day: 14, status: "late", clockIn: "09:45", clockOut: "18:30", aiTip: "迟到45分钟，无门禁早到记录", anomalyMinutes: 45 },
  { day: 17, status: "leave", clockIn: "—", clockOut: "—", aiTip: "病假一天", leaveType: "病假" },
  { day: 19, status: "overtime", clockIn: "09:00", clockOut: "17:00", aiTip: "周末加班",
    accessOverride: [
      { time: "08:45", direction: "入厂", gate: "正门", method: "门禁卡", cardNo: "#1042" },
      { time: "19:30", direction: "出厂", gate: "正门", method: "门禁卡", cardNo: "#1042" },
    ] },
  { day: 21, status: "late", clockIn: "09:15", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 08:58 入厂", anomalyMinutes: 15,
    accessOverride: [
      { time: "08:58", direction: "入厂", gate: "正门", method: "门禁卡", cardNo: "#1042" },
      { time: "18:20", direction: "出厂", gate: "正门", method: "门禁卡", cardNo: "#1042" },
    ] },
  { day: 23, status: "dayoff", clockIn: "—", clockOut: "—", aiTip: "调休，关联4/5加班" },
  { day: 25, status: "late", clockIn: "09:30", clockOut: "18:00", aiTip: "迟到30分钟", anomalyMinutes: 30 },
  { day: 28, status: "leave", clockIn: "—", clockOut: "—", aiTip: "事假一天", leaveType: "事假" },
  { day: 30, status: "late", clockIn: "09:10", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 08:55 入厂", anomalyMinutes: 10,
    accessOverride: [
      { time: "08:55", direction: "入厂", gate: "正门", method: "门禁卡", cardNo: "#1042" },
      { time: "18:15", direction: "出厂", gate: "正门", method: "门禁卡", cardNo: "#1042" },
    ] },
];

const liSiSpecs: DaySpec[] = [
  { day: 3, status: "late", clockIn: "09:25", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 09:00 入厂", anomalyMinutes: 25,
    accessOverride: [
      { time: "09:00", direction: "入厂", gate: "正门", method: "门禁卡", cardNo: "#1055" },
      { time: "18:10", direction: "出厂", gate: "正门", method: "门禁卡", cardNo: "#1055" },
    ] },
  { day: 5, status: "overtime", clockIn: "09:00", clockOut: "17:00", aiTip: "周末加班" },
  { day: 8, status: "leave", clockIn: "—", clockOut: "—", aiTip: "年假一天", leaveType: "年假" },
  { day: 12, status: "overtime", clockIn: "09:00", clockOut: "17:00", aiTip: "周末加班" },
  { day: 15, status: "late", clockIn: "09:40", clockOut: "18:00", aiTip: "迟到40分钟，无门禁早到记录", anomalyMinutes: 40 },
  { day: 18, status: "leave", clockIn: "—", clockOut: "—", aiTip: "事假一天", leaveType: "事假" },
  { day: 22, status: "late", clockIn: "09:12", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 08:50 入厂", anomalyMinutes: 12,
    accessOverride: [
      { time: "08:50", direction: "入厂", gate: "正门", method: "门禁卡", cardNo: "#1055" },
      { time: "18:15", direction: "出厂", gate: "正门", method: "门禁卡", cardNo: "#1055" },
    ] },
  { day: 24, status: "dayoff", clockIn: "—", clockOut: "—", aiTip: "调休" },
  { day: 29, status: "late", clockIn: "09:18", clockOut: "18:00", aiTip: "迟到18分钟", anomalyMinutes: 18 },
];

const wangWuSpecs: DaySpec[] = [
  { day: 1, status: "late", clockIn: "09:30", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 09:10 入门", anomalyMinutes: 30,
    accessOverride: [
      { time: "09:10", direction: "入门", gate: "大楼正门", method: "门禁卡", cardNo: "#2001" },
      { time: "18:20", direction: "出厂", gate: "大楼正门", method: "门禁卡", cardNo: "#2001" },
    ] },
  { day: 6, status: "leave", clockIn: "—", clockOut: "—", aiTip: "事假一天", leaveType: "事假" },
  { day: 11, status: "overtime", clockIn: "08:30", clockOut: "21:00", aiTip: "加班3小时",
    accessOverride: [
      { time: "08:20", direction: "入门", gate: "大楼正门", method: "门禁卡", cardNo: "#2001" },
      { time: "22:05", direction: "出厂", gate: "大楼正门", method: "门禁卡", cardNo: "#2001" },
    ] },
  { day: 12, status: "overtime", clockIn: "09:00", clockOut: "16:00", aiTip: "周末加班" },
  { day: 14, status: "late", clockIn: "09:22", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 09:10 入门", anomalyMinutes: 22,
    accessOverride: [
      { time: "09:10", direction: "入门", gate: "大楼正门", method: "门禁卡", cardNo: "#2001" },
      { time: "18:30", direction: "出厂", gate: "大楼正门", method: "门禁卡", cardNo: "#2001" },
    ] },
  { day: 16, status: "leave", clockIn: "—", clockOut: "—", aiTip: "病假一天", leaveType: "病假" },
  { day: 20, status: "dayoff", clockIn: "—", clockOut: "—", aiTip: "调休" },
  { day: 23, status: "late", clockIn: "09:35", clockOut: "18:30", aiTip: "迟到35分钟，无门禁早到记录", anomalyMinutes: 35 },
  { day: 28, status: "leave", clockIn: "—", clockOut: "—", aiTip: "年假一天", leaveType: "年假" },
];

const zhaoLiuSpecs: DaySpec[] = [
  { day: 1, status: "late", clockIn: "09:15", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 08:55 入门", anomalyMinutes: 15,
    accessOverride: [
      { time: "08:55", direction: "入门", gate: "大楼正门", method: "门禁卡", cardNo: "#2010" },
      { time: "18:10", direction: "出厂", gate: "大楼正门", method: "门禁卡", cardNo: "#2010" },
    ] },
  { day: 3, status: "leave", clockIn: "—", clockOut: "—", aiTip: "事假一天", leaveType: "事假" },
  { day: 5, status: "overtime", clockIn: "09:00", clockOut: "17:00", aiTip: "周末加班" },
  { day: 7, status: "late", clockIn: "09:40", clockOut: "18:00", aiTip: "迟到40分钟，无门禁早到记录", anomalyMinutes: 40 },
  { day: 9, status: "leave", clockIn: "—", clockOut: "—", aiTip: "病假一天", leaveType: "病假" },
  { day: 12, status: "overtime", clockIn: "09:00", clockOut: "16:00", aiTip: "周末加班" },
  { day: 14, status: "late", clockIn: "09:50", clockOut: "18:30", aiTip: "迟到50分钟，门禁无早到记录", anomalyMinutes: 50 },
  { day: 16, status: "leave", clockIn: "—", clockOut: "—", aiTip: "事假一天", leaveType: "事假" },
  { day: 19, status: "overtime", clockIn: "09:00", clockOut: "15:00", aiTip: "周末加班",
    accessOverride: [
      { time: "08:40", direction: "入门", gate: "大楼正门", method: "门禁卡", cardNo: "#2010" },
      { time: "17:45", direction: "出厂", gate: "大楼正门", method: "门禁卡", cardNo: "#2010" },
    ] },
  { day: 21, status: "late", clockIn: "09:25", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 09:02 入门", anomalyMinutes: 25,
    accessOverride: [
      { time: "09:02", direction: "入门", gate: "大楼正门", method: "门禁卡", cardNo: "#2010" },
      { time: "18:15", direction: "出厂", gate: "大楼正门", method: "门禁卡", cardNo: "#2010" },
    ] },
  { day: 24, status: "dayoff", clockIn: "—", clockOut: "—", aiTip: "调休" },
  { day: 27, status: "late", clockIn: "09:20", clockOut: "18:00", aiTip: "迟到20分钟", anomalyMinutes: 20 },
  { day: 29, status: "leave", clockIn: "—", clockOut: "—", aiTip: "病假一天", leaveType: "病假" },
];

const sunQiSpecs: DaySpec[] = [
  { day: 2, status: "late", clockIn: "09:20", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 08:52 入厂", anomalyMinutes: 20,
    accessOverride: [
      { time: "08:52", direction: "入厂", gate: "正门", method: "门禁卡", cardNo: "#1080" },
      { time: "18:20", direction: "出厂", gate: "正门", method: "门禁卡", cardNo: "#1080" },
    ] },
  { day: 5, status: "overtime", clockIn: "09:00", clockOut: "17:00", aiTip: "周末加班" },
  { day: 8, status: "leave", clockIn: "—", clockOut: "—", aiTip: "事假一天", leaveType: "事假" },
  { day: 12, status: "overtime", clockIn: "09:00", clockOut: "16:00", aiTip: "周末加班" },
  { day: 14, status: "late", clockIn: "09:30", clockOut: "18:00", aiTip: "迟到30分钟，无门禁早到记录", anomalyMinutes: 30 },
  { day: 17, status: "leave", clockIn: "—", clockOut: "—", aiTip: "病假一天", leaveType: "病假" },
  { day: 22, status: "late", clockIn: "09:15", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 08:48 入厂", anomalyMinutes: 15,
    accessOverride: [
      { time: "08:48", direction: "入厂", gate: "正门", method: "门禁卡", cardNo: "#1080" },
      { time: "18:25", direction: "出厂", gate: "正门", method: "门禁卡", cardNo: "#1080" },
    ] },
  { day: 25, status: "dayoff", clockIn: "—", clockOut: "—", aiTip: "调休" },
  { day: 28, status: "late", clockIn: "09:10", clockOut: "18:00", aiTip: "迟到10分钟", anomalyMinutes: 10 },
];

const zhouBaSpecs: DaySpec[] = [
  { day: 3, status: "late", clockIn: "09:18", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 08:55 入门", anomalyMinutes: 18,
    accessOverride: [
      { time: "08:55", direction: "入门", gate: "大楼正门", method: "门禁卡", cardNo: "#2030" },
      { time: "18:20", direction: "出厂", gate: "大楼正门", method: "门禁卡", cardNo: "#2030" },
    ] },
  { day: 5, status: "overtime", clockIn: "09:00", clockOut: "17:00", aiTip: "周末加班" },
  { day: 9, status: "leave", clockIn: "—", clockOut: "—", aiTip: "年假一天", leaveType: "年假" },
  { day: 14, status: "late", clockIn: "09:25", clockOut: "18:00", aiTip: "迟到25分钟，无门禁早到记录", anomalyMinutes: 25 },
  { day: 19, status: "overtime", clockIn: "09:00", clockOut: "15:00", aiTip: "周末加班" },
  { day: 22, status: "late", clockIn: "09:12", clockOut: "18:00", aiTip: "迟到12分钟", anomalyMinutes: 12 },
  { day: 26, status: "overtime", clockIn: "09:00", clockOut: "17:00", aiTip: "周末加班" },
  { day: 29, status: "leave", clockIn: "—", clockOut: "—", aiTip: "事假一天", leaveType: "事假" },
];

const wuJiuSpecs: DaySpec[] = [
  { day: 1, status: "late", clockIn: "09:22", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 08:50 入厂", anomalyMinutes: 22,
    accessOverride: [
      { time: "08:50", direction: "入厂", gate: "正门", method: "门禁卡", cardNo: "#1095" },
      { time: "18:15", direction: "出厂", gate: "正门", method: "门禁卡", cardNo: "#1095" },
    ] },
  { day: 5, status: "overtime", clockIn: "09:00", clockOut: "17:00", aiTip: "周末加班" },
  { day: 10, status: "leave", clockIn: "—", clockOut: "—", aiTip: "事假一天", leaveType: "事假" },
  { day: 12, status: "overtime", clockIn: "09:00", clockOut: "16:00", aiTip: "周末加班" },
  { day: 16, status: "late", clockIn: "09:35", clockOut: "18:00", aiTip: "迟到35分钟", anomalyMinutes: 35 },
  { day: 20, status: "dayoff", clockIn: "—", clockOut: "—", aiTip: "调休" },
  { day: 24, status: "late", clockIn: "09:15", clockOut: "18:00", aiTip: "疑似漏打卡，门禁 08:52 入厂", anomalyMinutes: 15,
    accessOverride: [
      { time: "08:52", direction: "入厂", gate: "正门", method: "门禁卡", cardNo: "#1095" },
      { time: "18:25", direction: "出厂", gate: "正门", method: "门禁卡", cardNo: "#1095" },
    ] },
  { day: 28, status: "leave", clockIn: "—", clockOut: "—", aiTip: "病假一天", leaveType: "病假" },
];

function createEmployee(
  id: string, name: string, campus: Campus, positionType: PositionType,
  anomalyCount: number, avatarColor: string, dept: string,
  employeeNo: string, supervisor: string, dingId: string, accessCardNo: string,
  hireDate: string, specs: DaySpec[]
): HeatmapEmployee {
  const days = buildDays(specs, campus);
  const anomalies = buildAnomalies(days);
  const timeline = buildTimeline(days);
  const stats = buildStats(days, anomalyCount);
  return {
    id, name, campus, positionType, anomalyCount, avatarColor, days,
    employeeNo, hireDate, supervisor, dingId, accessCardNo, dept,
    stats, anomalies, timeline,
  };
}

export const heatmapEmployees: HeatmapEmployee[] = [
  createEmployee("H001", "张三", "鄂州工厂", "生产岗", 7, "bg-emerald-500", "生产部",
    "EZ-2024001", "刘主管", "zhangsan_ez", "AC10001", "2024-03-15", zhangSanSpecs),
  createEmployee("H002", "李四", "鄂州工厂", "质检岗", 5, "bg-amber-500", "质检部",
    "EZ-2024002", "陈主管", "lisi_ez", "AC10002", "2024-05-20", liSiSpecs),
  createEmployee("H003", "王五", "武汉总部", "销售岗", 5, "bg-violet-500", "销售部",
    "WH-2023015", "周经理", "wangwu_wh", "AC20001", "2023-08-10", wangWuSpecs),
  createEmployee("H004", "赵六", "武汉总部", "行政岗", 7, "bg-red-500", "行政部",
    "WH-2023008", "马主任", "zhaoliu_wh", "AC20002", "2023-02-28", zhaoLiuSpecs),
  createEmployee("H005", "孙七", "鄂州工厂", "生产岗", 5, "bg-orange-500", "生产部",
    "EZ-2024005", "刘主管", "sunqi_ez", "AC10005", "2024-06-01", sunQiSpecs),
  createEmployee("H006", "周八", "武汉总部", "研发岗", 4, "bg-blue-500", "研发部",
    "WH-2022003", "李总监", "zhouba_wh", "AC20003", "2022-11-15", zhouBaSpecs),
  createEmployee("H007", "吴九", "鄂州工厂", "生产岗", 4, "bg-orange-500", "生产部",
    "EZ-2024007", "刘主管", "wujiu_ez", "AC10007", "2024-07-10", wuJiuSpecs),
];

// ========== 统计计数 ==========

export function getFilterCounts(employees: HeatmapEmployee[]) {
  let total = 0, abnormal = 0, overtime = 0, leave = 0, dayoff = 0;
  for (const emp of employees) {
    for (const d of emp.days) {
      total++;
      if (d.status === "late") abnormal++;
      if (d.status === "leave") { abnormal++; leave++; }
      if (d.status === "overtime") overtime++;
      if (d.status === "dayoff") dayoff++;
    }
  }
  return { total, abnormal, overtime, leave, dayoff };
}

// ========== Mock 数据 (unchanged exports) ==========

export const todayExceptions: ExceptionRow[] = [
  {
    id: "E001", name: "李明", dept: "研发部", position: "高级工程师",
    group: "总部考勤组", clockIn: "09:35", clockOut: "18:30",
    type: "迟到", aiSuggestion: "疑似漏打卡，门禁 08:58 有入门记录，建议通知员工补卡", status: "pending",
  },
  {
    id: "E002", name: "王芳", dept: "市场部", position: "市场经理",
    group: "总部考勤组", clockIn: "09:00", clockOut: "—",
    type: "缺卡", aiSuggestion: "存在请假审批记录，等待钉钉数据回流确认", status: "pending",
  },
  {
    id: "E003", name: "钱七", dept: "运营部", position: "运营专员",
    group: "总部考勤组", clockIn: "09:10", clockOut: "18:00",
    type: "迟到", aiSuggestion: "疑似漏打卡，门禁 08:58 有入门记录，建议通知员工补卡", status: "pending",
  },
  {
    id: "E004", name: "张伟", dept: "销售部", position: "销售总监",
    group: "外勤考勤组", clockIn: "—", clockOut: "—",
    type: "旷工", aiSuggestion: "无打卡记录且无门禁记录，建议通知员工说明情况", status: "notified",
  },
  {
    id: "E005", name: "赵六", dept: "产品部", position: "产品经理",
    group: "总部考勤组", clockIn: "08:55", clockOut: "17:30",
    type: "早退", aiSuggestion: "门禁 17:35 出门，存在调休记录，等待钉钉回流", status: "notified",
  },
];

export const anomalyTrend = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  count: Math.max(0, Math.floor(Math.random() * 8) + (i % 7 === 5 || i % 7 === 6 ? 0 : 2)),
}));

export const campusDistribution = [
  { name: "武汉总部", value: 42, color: "#6366F1" },
  { name: "鄂州工厂", value: 58, color: "#F59E0B" },
];

export const rulesSummary = [
  "调休申请校验", "晚班餐补自动计算", "生产岗加班费计算", "非生产岗加班费计算", "考勤异常扣款规则",
];

export const overtimeRows: OvertimeRow[] = [
  { id: "OT01", name: "张三", dept: "生产部", position: "生产岗", group: "鄂州工厂", date: "2026-04-14", startTime: "18:00", endTime: "21:00", reason: "订单赶工", hours: 3, canDayoff: 3, subsidy: 54, remark: "含餐补¥15" },
  { id: "OT02", name: "李四", dept: "质检部", position: "质检岗", group: "鄂州工厂", date: "2026-04-14", startTime: "18:00", endTime: "20:30", reason: "产品抽检", hours: 2.5, canDayoff: 2.5, subsidy: 45, remark: "含餐补¥15" },
  { id: "OT03", name: "王五", dept: "销售部", position: "销售岗", group: "武汉总部", date: "2026-04-12", startTime: "18:00", endTime: "21:00", reason: "客户提案", hours: 3, canDayoff: 3, subsidy: 0, remark: "非生产岗1.5倍" },
  { id: "OT04", name: "赵六", dept: "行政部", position: "行政岗", group: "武汉总部", date: "2026-04-13", startTime: "09:00", endTime: "17:00", reason: "周末值班", hours: 8, canDayoff: 8, subsidy: 0, remark: "周末加班可调休" },
  { id: "OT05", name: "孙七", dept: "生产部", position: "生产岗", group: "鄂州工厂", date: "2026-04-15", startTime: "18:00", endTime: "22:00", reason: "设备维修", hours: 4, canDayoff: 4, subsidy: 87, remark: "含餐补¥15" },
  { id: "OT06", name: "周八", dept: "研发部", position: "研发岗", group: "武汉总部", date: "2026-04-16", startTime: "18:00", endTime: "21:30", reason: "版本上线", hours: 3.5, canDayoff: 3.5, subsidy: 0, remark: "非生产岗1.5倍" },
];

export const dayoffRows: DayoffRow[] = [
  { id: "DO01", name: "张三", dept: "生产部", totalHours: 24, usedHours: 8, remainHours: 16, lastUsedDate: "2026-04-10" },
  { id: "DO02", name: "李四", dept: "质检部", totalHours: 16, usedHours: 8, remainHours: 8, lastUsedDate: "2026-04-08" },
  { id: "DO03", name: "王五", dept: "销售部", totalHours: 16, usedHours: 0, remainHours: 16, lastUsedDate: "—" },
  { id: "DO04", name: "赵六", dept: "行政部", totalHours: 32, usedHours: 16, remainHours: 16, lastUsedDate: "2026-04-12" },
  { id: "DO05", name: "孙七", dept: "生产部", totalHours: 20, usedHours: 4, remainHours: 16, lastUsedDate: "2026-04-05" },
  { id: "DO06", name: "周八", dept: "研发部", totalHours: 24, usedHours: 8, remainHours: 16, lastUsedDate: "2026-04-11" },
  { id: "DO07", name: "吴九", dept: "生产部", totalHours: 12, usedHours: 4, remainHours: 8, lastUsedDate: "2026-04-09" },
];

export const attendanceRules: AttendanceRule[] = [
  {
    id: "R001", icon: "Repeat2", iconColor: "text-teal-600", iconBg: "bg-teal-50",
    category: "调休规则", name: "调休申请校验",
    description: "仅周末加班可申请调休；系统自动校对匹配加班日期和时长；同一加班记录仅可核销一次，重复申请自动拦截。",
    enabled: true,
  },
  {
    id: "R002", icon: "Coffee", iconColor: "text-orange-600", iconBg: "bg-orange-50",
    category: "鄂州餐补", name: "晚班餐补自动计算",
    description: "鄂州工厂员工，晚上加班超过 20:00，自动计入 ¥15/次餐补。",
    enabled: true,
  },
  {
    id: "R003", icon: "Moon", iconColor: "text-violet-600", iconBg: "bg-violet-50",
    category: "生产加班", name: "生产岗加班费计算",
    description: "生产岗加班按 ¥18/小时计算；工作日 18:00 后算加班；员工可选择调休或直接算入工资。",
    enabled: true,
  },
  {
    id: "R004", icon: "Briefcase", iconColor: "text-blue-600", iconBg: "bg-blue-50",
    category: "非生产加班", name: "非生产岗加班费计算",
    description: "非生产岗加班按 1.5 倍时薪计算（基本工资 ÷ 21.75 ÷ 8 × 1.5）。",
    enabled: true,
  },
  {
    id: "R005", icon: "AlertTriangle", iconColor: "text-red-600", iconBg: "bg-red-50",
    category: "考勤扣款", name: "考勤异常扣款规则",
    description: "迟到/早退 ¥20/次；事假按日薪扣款（基本工资 ÷ 21.75）；病假按日薪 × 40% 扣款。",
    enabled: true,
  },
];
