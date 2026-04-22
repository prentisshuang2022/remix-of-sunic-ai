/**
 * 员工展开详情卡片 — 包含4个区块
 * [BACKEND] 所有数据由后端 API 提供
 */
import { useState, useMemo } from "react";
import { Download, MessageSquare, Sparkles, ChevronUp, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { HeatmapEmployee, DayCell, DayStatus } from "@/mocks/attendance";

const statusLabel: Record<DayStatus, string> = {
  normal: "正常", late: "迟到", overtime: "加班",
  leave: "请假", dayoff: "调休", weekend: "周末",
};

const statusBadgeClass: Record<DayStatus, string> = {
  normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
  late: "bg-amber-50 text-amber-700 border-amber-200",
  overtime: "bg-violet-50 text-violet-700 border-violet-200",
  leave: "bg-red-50 text-red-700 border-red-200",
  dayoff: "bg-blue-50 text-blue-700 border-blue-200",
  weekend: "bg-muted text-muted-foreground border-border",
};

const weekdayLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

interface Props {
  employee: HeatmapEmployee;
  activeFilter: string;
  onCollapse: () => void;
}

export default function EmployeeDetailCard({ employee, activeFilter, onCollapse }: Props) {
  const [showAnomalyOnly, setShowAnomalyOnly] = useState(activeFilter !== "全部" && activeFilter !== "加班");

  // [FRONTEND-ONLY] Filter days based on active filter
  const filteredDays = useMemo(() => {
    if (!showAnomalyOnly && activeFilter === "全部") return employee.days;
    return employee.days.filter((d) => {
      if (showAnomalyOnly && activeFilter === "全部") return d.status === "late" || d.status === "leave";
      if (activeFilter === "异常") return d.status === "late" || d.status === "leave";
      if (activeFilter === "加班") return d.status === "overtime";
      if (activeFilter === "请假") return d.status === "leave";
      if (activeFilter === "调休") return d.status === "dayoff";
      return true;
    });
  }, [employee.days, showAnomalyOnly, activeFilter]);

  const { stats, anomalies, timeline } = employee;

  return (
    <div className="rounded-xl border border-primary/20 bg-[hsl(245_50%_99%)] p-5 space-y-6 animate-fade-in">
      {/* ── 区块 1: 员工月度画像 ── */}
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "本月出勤", value: `${stats.attendanceDays}/${stats.totalDays} 天` },
            { label: "总工时", value: `${stats.totalWorkHours} 小时` },
            { label: "异常次数", value: `${stats.anomalyCount} 次`, danger: true },
            { label: "加班时长", value: `${stats.overtimeHours} 小时` },
            { label: "待处理", value: `${stats.pendingCount} 项`, pulse: stats.pendingCount > 0 },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border bg-card p-3 text-center">
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className={cn("mt-1 text-lg font-semibold",
                item.danger && "text-red-600",
                item.pulse && "text-red-600"
              )}>
                {item.value}
                {item.pulse && <span className="inline-block ml-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex gap-4">
            <span>工号: {employee.employeeNo}</span>
            <span>入职: {employee.hireDate}</span>
            <span>上级: {employee.supervisor}</span>
            <span>钉钉: {employee.dingId}</span>
            <span>门禁: {employee.accessCardNo}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Download className="h-3 w-3" />导出月报
            </Button>
            <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground">
              发起异常核销
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7">
              <MessageSquare className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 区块 2: 每日打卡明细表 ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">每日打卡明细</h4>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">仅显示异常</span>
            <Switch checked={showAnomalyOnly} onCheckedChange={setShowAnomalyOnly} className="scale-75" />
          </div>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs w-24">日期</TableHead>
                <TableHead className="text-xs w-20">应上班</TableHead>
                <TableHead className="text-xs w-24">实际上班</TableHead>
                <TableHead className="text-xs w-20">应下班</TableHead>
                <TableHead className="text-xs w-24">实际下班</TableHead>
                <TableHead className="text-xs w-16">工时</TableHead>
                <TableHead className="text-xs w-20">状态</TableHead>
                <TableHead className="text-xs">AI 建议</TableHead>
                <TableHead className="text-xs w-12">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDays.map((day) => (
                <DayRow key={day.day} day={day} />
              ))}
              {filteredDays.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                    当前筛选条件下无记录
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── 区块 3: 异常聚合视图 ── */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">本月异常汇总（{anomalies.length} 项）</h4>
        <div className="grid grid-cols-2 gap-3">
          {anomalies.map((a) => (
            <div key={a.day} className="rounded-lg border bg-card p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">4月{String(a.day).padStart(2, "0")}日 · {a.weekdayLabel}</span>
                <Badge variant="outline" className={cn("text-[10px]",
                  a.processStatus === "待处理" && "bg-amber-50 text-amber-700 border-amber-200",
                  a.processStatus === "已核销" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                  a.processStatus === "已扣款" && "bg-red-50 text-red-700 border-red-200",
                )}>{a.processStatus}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                  {a.type}
                </Badge>
                <span className="text-xs text-muted-foreground">{a.description}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Sparkles className="h-3 w-3 text-violet-500" />
                <span className="text-violet-600">{a.aiSuggestion}</span>
                {a.evidence && <span className="text-muted-foreground">· {a.evidence}</span>}
              </div>
              {a.processStatus === "待处理" && (
                <Button variant="outline" size="sm" className="h-6 text-[10px] mt-1">处理 →</Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 区块 4: 加班/调休时间线 ── */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">加班与调休记录</h4>
        <div className="relative pl-6 space-y-0">
          {/* Vertical line */}
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
          {timeline.map((entry, idx) => (
            <div key={idx} className="relative flex items-start gap-3 pb-4">
              <div className={cn(
                "absolute left-[-15px] top-1.5 h-3 w-3 rounded-full border-2 border-card",
                entry.type === "overtime" ? "bg-violet-500" : "bg-blue-500"
              )} />
              <div className="flex-1 text-sm">
                <span className="text-muted-foreground">4月{String(entry.day).padStart(2, "0")}日</span>
                <span className="ml-2">{entry.description}</span>
                {entry.linkedDay && (
                  <span className="ml-2 text-xs text-emerald-600">
                    → {entry.type === "overtime" ? `已调休（4/${entry.linkedDay}）✓` : `核销加班记录 4/${entry.linkedDay}`}
                  </span>
                )}
                {entry.canApply && (
                  <Button variant="outline" size="sm" className="ml-2 h-5 text-[10px] px-2">
                    立即申请
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Summary bar */}
        {(() => {
          const otHours = timeline.filter(t => t.type === "overtime").reduce((s, t) => s + t.hours, 0);
          const dfHours = timeline.filter(t => t.type === "dayoff").reduce((s, t) => s + t.hours, 0);
          const balance = otHours - dfHours;
          return (
            <div className="rounded-lg bg-muted/60 px-4 py-2 text-xs text-muted-foreground flex gap-4">
              <span>本月加班 {otHours}h</span>
              <span>已调休 {dfHours}h</span>
              <span>可用余额 {balance}h</span>
              <span>预计补贴 ¥{balance * 18}</span>
            </div>
          );
        })()}
      </div>

      {/* 收起按钮 */}
      <div className="flex justify-center pt-2">
        <Button variant="outline" size="sm" onClick={onCollapse} className="gap-1.5 text-xs">
          <ChevronUp className="h-3.5 w-3.5" />
          收起
        </Button>
      </div>
    </div>
  );
}

function DayRow({ day }: { day: DayCell }) {
  const isAnomaly = day.status === "late" || day.status === "leave";
  const isOvertime = day.status === "overtime";
  const isWeekend = day.status === "weekend";
  const lateMinutes = day.anomalyMinutes;

  return (
    <TableRow className={cn(
      "text-xs",
      isAnomaly && "bg-amber-50/50",
      isOvertime && "bg-violet-50/30",
      isWeekend && "text-muted-foreground"
    )}>
      <TableCell className="py-2">
        <span>4月{String(day.day).padStart(2, "0")}日</span>
        <span className="ml-1 text-muted-foreground">{weekdayLabels[day.weekday]}</span>
      </TableCell>
      <TableCell className="py-2">{day.scheduledIn || "—"}</TableCell>
      <TableCell className={cn("py-2", lateMinutes && "text-red-600 font-medium")}>
        {day.clockIn || "—"}
        {lateMinutes ? <span className="ml-1 text-[10px]">+{lateMinutes}min</span> : null}
      </TableCell>
      <TableCell className="py-2">{day.scheduledOut || "—"}</TableCell>
      <TableCell className="py-2">{day.clockOut || "—"}</TableCell>
      <TableCell className="py-2">{day.workHours ? `${day.workHours}h` : "—"}</TableCell>
      <TableCell className="py-2">
        <Badge variant="outline" className={cn("text-[10px]", statusBadgeClass[day.status])}>
          {statusLabel[day.status]}
        </Badge>
      </TableCell>
      <TableCell className="py-2">
        {day.aiTip && (
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-violet-500 shrink-0" />
            <span className="text-violet-600 truncate max-w-[200px]">{day.aiTip}</span>
          </div>
        )}
      </TableCell>
      <TableCell className="py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            <DropdownMenuItem>补卡</DropdownMenuItem>
            <DropdownMenuItem>核销</DropdownMenuItem>
            <DropdownMenuItem>标记已处理</DropdownMenuItem>
            <DropdownMenuItem>查看门禁记录</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
