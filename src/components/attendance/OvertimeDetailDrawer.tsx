/**
 * 加班明细详情抽屉
 * [FRONTEND-ONLY] 纯展示组件，只读模式
 */
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

/* ── types ── */
interface ClockRecord {
  time: string;
  event: string;
  location: string;
  device: string;
  isOvertime?: boolean;
}

interface DayoffUsage {
  date: string;
  hours: number;
  remain: number;
  remark: string;
}

export interface OvertimeDetail {
  id: string;
  name: string;
  dept: string;
  position: string;
  campus: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  hours: number;
  canDayoff: number;
  subsidy: number;
  /** 工作日/周末/节假日 */
  dayType: "workday" | "weekend" | "holiday";
  /** 生产岗/非生产岗 */
  posType: "production" | "non-production";
  /** 工时倍率 */
  rate: number;
  mealAllowance: number;
  totalAllowance: number;
  clockRecords: ClockRecord[];
  /** 核对结果 */
  checkResult: { ok: boolean; message: string };
  /** 调休 */
  dayoff: {
    total: number;
    used: number;
    remain: number;
    expireDate: string;
    usages: DayoffUsage[];
  };
}

/* ── mock detail data ── */
export const overtimeDetails: Record<string, OvertimeDetail> = {
  OT01: {
    id: "OT01", name: "张三", dept: "生产部", position: "生产岗", campus: "鄂州工厂",
    date: "2026-04-14", startTime: "18:00", endTime: "21:00", reason: "订单赶工",
    hours: 3, canDayoff: 3, subsidy: 54, dayType: "workday", posType: "production",
    rate: 1, mealAllowance: 15, totalAllowance: 54,
    clockRecords: [
      { time: "08:58", event: "上班打卡", location: "鄂州工厂 - A栋1楼", device: "iPhone 15 · WiFi: SUNIC-OFFICE" },
      { time: "18:02", event: "下班打卡", location: "鄂州工厂 - A栋1楼", device: "iPhone 15 · WiFi: SUNIC-OFFICE" },
      { time: "18:05", event: "加班开始", location: "鄂州工厂 - A栋1楼", device: "iPhone 15 · WiFi: SUNIC-OFFICE", isOvertime: true },
      { time: "21:03", event: "加班结束", location: "鄂州工厂 - A栋1楼", device: "iPhone 15 · WiFi: SUNIC-OFFICE", isOvertime: true },
    ],
    checkResult: { ok: true, message: "钉钉核算时长 2h58min，按制度向上取整为 3h，与加班申请一致" },
    dayoff: { total: 3, used: 0, remain: 3, expireDate: "2026-07-14", usages: [] },
  },
  OT02: {
    id: "OT02", name: "李四", dept: "质检部", position: "质检岗", campus: "鄂州工厂",
    date: "2026-04-14", startTime: "18:00", endTime: "20:30", reason: "产品抽检",
    hours: 2.5, canDayoff: 2.5, subsidy: 45, dayType: "workday", posType: "production",
    rate: 1, mealAllowance: 15, totalAllowance: 45,
    clockRecords: [
      { time: "09:02", event: "上班打卡", location: "鄂州工厂 - B栋2楼", device: "HUAWEI Mate60 · WiFi: SUNIC-OFFICE" },
      { time: "18:00", event: "下班打卡", location: "鄂州工厂 - B栋2楼", device: "HUAWEI Mate60 · WiFi: SUNIC-OFFICE" },
      { time: "18:03", event: "加班开始", location: "鄂州工厂 - B栋2楼", device: "HUAWEI Mate60 · WiFi: SUNIC-OFFICE", isOvertime: true },
      { time: "20:32", event: "加班结束", location: "鄂州工厂 - B栋2楼", device: "HUAWEI Mate60 · WiFi: SUNIC-OFFICE", isOvertime: true },
    ],
    checkResult: { ok: true, message: "钉钉核算时长 2h29min，按制度向上取整为 2.5h，与加班申请一致" },
    dayoff: {
      total: 2.5, used: 0.5, remain: 2, expireDate: "2026-07-14",
      usages: [{ date: "2026-04-18", hours: 0.5, remain: 2, remark: "下午提前下班" }],
    },
  },
  OT03: {
    id: "OT03", name: "王五", dept: "销售部", position: "销售岗", campus: "武汉总部",
    date: "2026-04-12", startTime: "18:00", endTime: "21:00", reason: "客户提案",
    hours: 3, canDayoff: 3, subsidy: 0, dayType: "workday", posType: "non-production",
    rate: 1.5, mealAllowance: 0, totalAllowance: 0,
    clockRecords: [
      { time: "09:15", event: "上班打卡", location: "武汉总部 - 8楼", device: "iPhone 14 Pro · GPS定位" },
      { time: "18:05", event: "下班打卡", location: "武汉总部 - 8楼", device: "iPhone 14 Pro · GPS定位" },
      { time: "18:10", event: "加班开始", location: "武汉总部 - 8楼", device: "iPhone 14 Pro · GPS定位", isOvertime: true },
      { time: "21:08", event: "加班结束", location: "武汉总部 - 8楼", device: "iPhone 14 Pro · GPS定位", isOvertime: true },
    ],
    checkResult: { ok: false, message: "钉钉核算 2h58min，按制度取整为 3h" },
    dayoff: { total: 3, used: 0, remain: 3, expireDate: "2026-07-12", usages: [] },
  },
  OT04: {
    id: "OT04", name: "赵六", dept: "行政部", position: "行政岗", campus: "武汉总部",
    date: "2026-04-13", startTime: "09:00", endTime: "17:00", reason: "周末值班",
    hours: 8, canDayoff: 8, subsidy: 0, dayType: "weekend", posType: "non-production",
    rate: 2, mealAllowance: 0, totalAllowance: 0,
    clockRecords: [
      { time: "08:55", event: "上班打卡", location: "武汉总部 - 3楼", device: "HUAWEI P60 · WiFi: SUNIC-HQ" },
      { time: "17:03", event: "下班打卡", location: "武汉总部 - 3楼", device: "HUAWEI P60 · WiFi: SUNIC-HQ" },
    ],
    checkResult: { ok: true, message: "钉钉核算时长 8h08min，按制度取整为 8h，与加班申请一致" },
    dayoff: { total: 8, used: 0, remain: 8, expireDate: "2026-07-13", usages: [] },
  },
};

/* ── helper ── */
const dayTypeLabel: Record<string, { text: string; cls: string }> = {
  workday: { text: "工作日加班", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  weekend: { text: "周末加班", cls: "bg-orange-100 text-orange-700 border-orange-200" },
  holiday: { text: "节假日加班", cls: "bg-red-100 text-red-700 border-red-200" },
};
const posTypeLabel: Record<string, { text: string; cls: string }> = {
  production: { text: "生产岗", cls: "bg-green-100 text-green-700 border-green-200" },
  "non-production": { text: "非生产岗", cls: "bg-violet-100 text-violet-700 border-violet-200" },
};

/* ── component ── */
interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  detail: OvertimeDetail | null;
}

export default function OvertimeDetailDrawer({ open, onOpenChange, detail }: Props) {
  if (!detail) return null;
  const dt = dayTypeLabel[detail.dayType];
  const pt = posTypeLabel[detail.posType];
  const usedPct = detail.dayoff.total > 0 ? (detail.dayoff.used / detail.dayoff.total) * 100 : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[560px] sm:max-w-[560px] p-0 flex flex-col bg-[#F9FAFB]">
        {/* ── header ── */}
        <SheetHeader className="p-5 pb-4 bg-white border-b border-[#E5E7EB]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#3B5BDB] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {detail.name.charAt(0)}
              </div>
              <div>
                <SheetTitle className="text-base font-semibold text-[#111827]">{detail.name}</SheetTitle>
                <p className="text-xs text-[#6B7280] mt-0.5">{detail.dept} · {detail.position} · {detail.campus}</p>
              </div>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-1 rounded hover:bg-gray-100 text-[#6B7280]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="rounded-full text-xs bg-gray-100 text-[#374151] border-gray-200">{detail.date}</Badge>
            <Badge className="rounded-full text-xs bg-[#3B5BDB] text-white border-transparent">{detail.hours}h</Badge>
            <Badge variant="outline" className={`rounded-full text-xs border ${dt.cls}`}>{dt.text}</Badge>
            <Badge variant="outline" className={`rounded-full text-xs border ${pt.cls}`}>{pt.text}</Badge>
          </div>
        </SheetHeader>

        {/* ── scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* notices */}
          {detail.dayType === "weekend" && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <span className="shrink-0 mt-0.5">ⓘ</span>
              <span>本条为周末加班，按公司制度优先调休，不发放加班费</span>
            </div>
          )}
          {detail.posType === "non-production" && detail.dayType !== "weekend" && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs">
              <span className="shrink-0 mt-0.5">ⓘ</span>
              <span>非生产岗加班按 1.5 倍工时计入调休池</span>
            </div>
          )}

          {/* ── 区块2: 基础信息 ── */}
          <section>
            <SectionTitle>基础信息</SectionTitle>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <KV label="加班日期" value={detail.date} />
                <KV label="加班时间段" value={`${detail.startTime} - ${detail.endTime}`} />
                <KV label="加班事由" value={detail.reason} />
                <KV label="工时倍率" value={`${detail.rate}倍`} />
                <KV label="时长(h)" value={`${detail.hours}h`} />
                <KV label="可调休(h)" value={`${detail.canDayoff}h`} />
                <KV label="餐补(¥)" value={detail.mealAllowance > 0 ? `¥${detail.mealAllowance}` : "—"} />
                <KV label="加班补贴合计(¥)" value={detail.totalAllowance > 0 ? `¥${detail.totalAllowance}` : "—"} />
              </div>
            </div>
          </section>

          {/* ── 区块3: 钉钉打卡 ── */}
          <section>
            <SectionTitle>钉钉打卡记录</SectionTitle>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
              <div className="relative pl-6">
                {/* vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#E5E7EB]" />
                <div className="space-y-5">
                  {detail.clockRecords.map((r, i) => (
                    <div key={i} className="relative">
                      {/* dot */}
                      <div className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 ${
                        r.isOvertime ? "border-[#3B5BDB] bg-blue-100" : "border-[#D1D5DB] bg-white"
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#111827]">{r.time}</span>
                          <span className="text-sm text-[#374151]">{r.event}</span>
                          {r.isOvertime && (
                            <Badge className="rounded-full text-[10px] px-1.5 py-0 bg-[#3B5BDB] text-white border-transparent">加班</Badge>
                          )}
                        </div>
                        <p className="text-[13px] text-[#6B7280] mt-0.5">{r.location}</p>
                        <p className="text-xs text-[#9CA3AF]">{r.device}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* check result */}
              <div className={`mt-4 px-3 py-2 rounded-lg text-xs flex items-start gap-1.5 ${
                detail.checkResult.ok
                  ? "bg-gray-50 text-[#374151]"
                  : "bg-orange-50 text-orange-800 border border-orange-200"
              }`}>
                <span className="shrink-0">{detail.checkResult.ok ? "✓" : "⚠"}</span>
                <span>{detail.checkResult.message}</span>
              </div>
            </div>
          </section>

          {/* ── 区块4: 调休 ── */}
          <section>
            <SectionTitle>调休使用情况</SectionTitle>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 space-y-3">
              {/* progress */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#111827]">可调休 {detail.dayoff.total}h</span>
                <span className="text-[#6B7280] text-xs">已使用 {detail.dayoff.used}h · 剩余 {detail.dayoff.remain}h</span>
              </div>
              <Progress value={usedPct} className="h-2 [&>div]:bg-[#3B5BDB]" />
              <p className="text-xs text-[#9CA3AF]">调休有效期至 {detail.dayoff.expireDate}（加班日起 3 个月内）</p>

              {/* usage table */}
              {detail.dayoff.usages.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs h-8">使用日期</TableHead>
                      <TableHead className="text-xs h-8">使用时长</TableHead>
                      <TableHead className="text-xs h-8">剩余(h)</TableHead>
                      <TableHead className="text-xs h-8">备注</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.dayoff.usages.map((u, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm py-2">{u.date}</TableCell>
                        <TableCell className="text-sm py-2">{u.hours}h</TableCell>
                        <TableCell className="text-sm py-2">{u.remain}h</TableCell>
                        <TableCell className="text-sm text-[#6B7280] py-2">{u.remark}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center py-6 text-[#9CA3AF] text-sm">
                  <span className="text-2xl mb-1">📋</span>
                  暂无调休使用记录
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── footer ── */}
        <div className="border-t border-[#E5E7EB] bg-white px-5 py-3 flex justify-end">
          <Button onClick={() => onOpenChange(false)} className="bg-[#3B5BDB] hover:bg-[#364FC7] text-white">
            关闭
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-[#111827] mb-3">
      <span className="w-[3px] h-4 rounded-full bg-[#3B5BDB]" />
      {children}
    </h3>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[#6B7280] text-xs">{label}</span>
      <p className="font-medium text-[#111827] mt-0.5">{value}</p>
    </div>
  );
}
