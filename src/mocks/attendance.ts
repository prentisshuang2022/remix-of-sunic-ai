/**
 * 考勤助手模块 Mock 数据
 * [BACKEND] 所有数据将由后端 API 提供
 */

// ========== 类型定义 ==========

export type ExceptionType = "迟到" | "早退" | "缺卡" | "旷工";
export type ExceptionStatus = "pending" | "waiting-employee" | "approving" | "done";
export type Campus = "武汉总部" | "鄂州工厂";
export type PositionType = "生产岗" | "质检岗" | "销售岗" | "行政岗" | "研发岗";

export type DayStatus = "normal" | "late" | "overtime" | "leave" | "dayoff" | "weekend";

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

export interface DayCell {
  day: number;
  status: DayStatus;
  clockIn?: string;
  clockOut?: string;
  aiTip?: string;
}

export interface HeatmapEmployee {
  id: string;
  name: string;
  campus: Campus;
  positionType: PositionType;
  anomalyCount: number;
  avatarColor: string;
  days: DayCell[];
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

// ========== Mock 数据 ==========

export const todayExceptions: ExceptionRow[] = [
  {
    id: "E001", name: "李明", dept: "研发部", position: "高级工程师",
    group: "总部考勤组", clockIn: "09:35", clockOut: "18:30",
    type: "迟到", aiSuggestion: "无请假记录，建议发起补卡申请", status: "pending",
  },
  {
    id: "E002", name: "王芳", dept: "市场部", position: "市场经理",
    group: "总部考勤组", clockIn: "09:00", clockOut: "—",
    type: "缺卡", aiSuggestion: "存在请假审批，建议核销", status: "pending",
  },
  {
    id: "E003", name: "钱七", dept: "运营部", position: "运营专员",
    group: "总部考勤组", clockIn: "09:10", clockOut: "18:00",
    type: "迟到", aiSuggestion: "疑似漏打卡，有门禁记录 08:58", status: "pending",
  },
  {
    id: "E004", name: "张伟", dept: "销售部", position: "销售总监",
    group: "外勤考勤组", clockIn: "—", clockOut: "—",
    type: "旷工", aiSuggestion: "无任何审批记录，建议联系确认", status: "waiting-employee",
  },
  {
    id: "E005", name: "赵六", dept: "产品部", position: "产品经理",
    group: "总部考勤组", clockIn: "08:55", clockOut: "17:30",
    type: "早退", aiSuggestion: "存在加班调休记录，建议核销", status: "approving",
  },
];

// 30天异常趋势
export const anomalyTrend = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  count: Math.max(0, Math.floor(Math.random() * 8) + (i % 7 === 5 || i % 7 === 6 ? 0 : 2)),
}));

// 厂区分布
export const campusDistribution = [
  { name: "武汉总部", value: 42, color: "#6366F1" },
  { name: "鄂州工厂", value: 58, color: "#F59E0B" },
];

// 规则引擎状态
export const rulesSummary = [
  "调休申请校验", "晚班餐补自动计算", "生产岗加班费计算", "非生产岗加班费计算", "考勤异常扣款规则",
];

// ========== 热力图员工数据 ==========

function generateDays(anomalyCount: number): DayCell[] {
  const statuses: DayStatus[] = ["normal", "late", "overtime", "leave", "dayoff", "weekend"];
  const days: DayCell[] = [];
  let anomaliesLeft = anomalyCount;

  for (let d = 1; d <= 30; d++) {
    const weekday = new Date(2026, 3, d).getDay(); // April 2026
    if (weekday === 0 || weekday === 6) {
      // Some weekends have overtime
      if (Math.random() < 0.3) {
        days.push({ day: d, status: "overtime", clockIn: "09:00", clockOut: "17:00", aiTip: "周末加班" });
      } else {
        days.push({ day: d, status: "weekend" });
      }
    } else if (anomaliesLeft > 0 && Math.random() < 0.25) {
      const sub: DayStatus[] = ["late", "leave"];
      const s = sub[Math.floor(Math.random() * sub.length)];
      anomaliesLeft--;
      days.push({
        day: d, status: s,
        clockIn: s === "late" ? "09:35" : "—",
        clockOut: s === "leave" ? "—" : "18:00",
        aiTip: s === "late" ? "迟到35分钟" : "事假一天",
      });
    } else if (Math.random() < 0.15) {
      days.push({ day: d, status: "overtime", clockIn: "08:30", clockOut: "21:00", aiTip: "加班3小时" });
    } else if (Math.random() < 0.08) {
      days.push({ day: d, status: "dayoff", clockIn: "—", clockOut: "—", aiTip: "调休" });
    } else {
      days.push({ day: d, status: "normal", clockIn: "08:55", clockOut: "18:05" });
    }
  }
  // ensure exact anomaly count
  return days;
}

export const heatmapEmployees: HeatmapEmployee[] = [
  { id: "H001", name: "张三", campus: "鄂州工厂", positionType: "生产岗", anomalyCount: 7, avatarColor: "bg-emerald-500", days: generateDays(7) },
  { id: "H002", name: "李四", campus: "鄂州工厂", positionType: "质检岗", anomalyCount: 5, avatarColor: "bg-amber-500", days: generateDays(5) },
  { id: "H003", name: "王五", campus: "武汉总部", positionType: "销售岗", anomalyCount: 5, avatarColor: "bg-violet-500", days: generateDays(5) },
  { id: "H004", name: "赵六", campus: "武汉总部", positionType: "行政岗", anomalyCount: 7, avatarColor: "bg-red-500", days: generateDays(7) },
  { id: "H005", name: "孙七", campus: "鄂州工厂", positionType: "生产岗", anomalyCount: 5, avatarColor: "bg-orange-500", days: generateDays(5) },
  { id: "H006", name: "周八", campus: "武汉总部", positionType: "研发岗", anomalyCount: 4, avatarColor: "bg-blue-500", days: generateDays(4) },
  { id: "H007", name: "吴九", campus: "鄂州工厂", positionType: "生产岗", anomalyCount: 4, avatarColor: "bg-orange-500", days: generateDays(4) },
];

// ========== 加班明细 ==========

export const overtimeRows: OvertimeRow[] = [
  { id: "OT01", name: "张三", dept: "生产部", position: "生产岗", group: "鄂州工厂", date: "2026-04-14", startTime: "18:00", endTime: "21:00", reason: "订单赶工", hours: 3, canDayoff: 3, subsidy: 54, remark: "含餐补¥15" },
  { id: "OT02", name: "李四", dept: "质检部", position: "质检岗", group: "鄂州工厂", date: "2026-04-14", startTime: "18:00", endTime: "20:30", reason: "产品抽检", hours: 2.5, canDayoff: 2.5, subsidy: 45, remark: "含餐补¥15" },
  { id: "OT03", name: "王五", dept: "销售部", position: "销售岗", group: "武汉总部", date: "2026-04-12", startTime: "18:00", endTime: "21:00", reason: "客户提案", hours: 3, canDayoff: 3, subsidy: 0, remark: "非生产岗1.5倍" },
  { id: "OT04", name: "赵六", dept: "行政部", position: "行政岗", group: "武汉总部", date: "2026-04-13", startTime: "09:00", endTime: "17:00", reason: "周末值班", hours: 8, canDayoff: 8, subsidy: 0, remark: "周末加班可调休" },
  { id: "OT05", name: "孙七", dept: "生产部", position: "生产岗", group: "鄂州工厂", date: "2026-04-15", startTime: "18:00", endTime: "22:00", reason: "设备维修", hours: 4, canDayoff: 4, subsidy: 87, remark: "含餐补¥15" },
  { id: "OT06", name: "周八", dept: "研发部", position: "研发岗", group: "武汉总部", date: "2026-04-16", startTime: "18:00", endTime: "21:30", reason: "版本上线", hours: 3.5, canDayoff: 3.5, subsidy: 0, remark: "非生产岗1.5倍" },
];

// ========== 调休明细 ==========

export const dayoffRows: DayoffRow[] = [
  { id: "DO01", name: "张三", dept: "生产部", totalHours: 24, usedHours: 8, remainHours: 16, lastUsedDate: "2026-04-10" },
  { id: "DO02", name: "李四", dept: "质检部", totalHours: 16, usedHours: 8, remainHours: 8, lastUsedDate: "2026-04-08" },
  { id: "DO03", name: "王五", dept: "销售部", totalHours: 16, usedHours: 0, remainHours: 16, lastUsedDate: "—" },
  { id: "DO04", name: "赵六", dept: "行政部", totalHours: 32, usedHours: 16, remainHours: 16, lastUsedDate: "2026-04-12" },
  { id: "DO05", name: "孙七", dept: "生产部", totalHours: 20, usedHours: 4, remainHours: 16, lastUsedDate: "2026-04-05" },
  { id: "DO06", name: "周八", dept: "研发部", totalHours: 24, usedHours: 8, remainHours: 16, lastUsedDate: "2026-04-11" },
  { id: "DO07", name: "吴九", dept: "生产部", totalHours: 12, usedHours: 4, remainHours: 8, lastUsedDate: "2026-04-09" },
];

// ========== 规则引擎 ==========

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
