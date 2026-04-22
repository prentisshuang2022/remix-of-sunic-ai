/**
 * Tab 2: 考勤明细 — 全员月度热力图
 * [BACKEND] 热力图数据由后端 API 提供
 */
import { useState, useMemo } from "react";
import { Search, Download, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { heatmapEmployees, type Campus, type DayStatus, type HeatmapEmployee } from "@/mocks/attendance";

const campusOptions: (Campus | "全部厂区")[] = ["全部厂区", "武汉总部", "鄂州工厂"];
const statusOptions = ["全部", "异常", "加班", "请假", "调休"] as const;

const dayStyleMap: Record<DayStatus, { bg: string; text: string }> = {
  normal:   { bg: "bg-emerald-50",  text: "text-emerald-600" },
  late:     { bg: "bg-amber-50",    text: "text-amber-600" },
  overtime: { bg: "bg-violet-50",   text: "text-violet-600" },
  leave:    { bg: "bg-red-50",      text: "text-red-600" },
  dayoff:   { bg: "bg-blue-50",     text: "text-blue-600" },
  weekend:  { bg: "bg-muted",       text: "text-muted-foreground" },
};

const statusToFilter: Record<string, DayStatus[]> = {
  "异常": ["late"],
  "加班": ["overtime"],
  "请假": ["leave"],
  "调休": ["dayoff"],
};

export default function AttendanceHeatmap() {
  const [search, setSearch] = useState("");
  const [campus, setCampus] = useState<Campus | "全部厂区">("全部厂区");
  const [statusFilter, setStatusFilter] = useState<string>("全部");

  const filtered = useMemo(() => {
    return heatmapEmployees.filter((e) => {
      if (search && !e.name.includes(search)) return false;
      if (campus !== "全部厂区" && e.campus !== campus) return false;
      if (statusFilter !== "全部") {
        const matchStatuses = statusToFilter[statusFilter];
        if (matchStatuses && !e.days.some((d) => matchStatuses.includes(d.status))) return false;
      }
      return true;
    });
  }, [search, campus, statusFilter]);

  return (
    <div className="space-y-4">
      {/* 说明条 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          打卡数据自动采集 · 异常自动标记 · 规则自动分类
        </p>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-4 w-4" />
          导出 Excel
        </Button>
      </div>

      {/* 筛选区 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索员工姓名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 bg-muted/40 border-transparent focus-visible:bg-card"
          />
        </div>
        <div className="flex gap-1">
          {campusOptions.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={campus === c ? "default" : "outline"}
              className={cn("h-8 text-xs", campus === c && "bg-primary text-primary-foreground")}
              onClick={() => setCampus(c)}
            >
              {c}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {statusOptions.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              className={cn("h-8 text-xs", statusFilter === s && "bg-primary text-primary-foreground")}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* 员工热力图列表 */}
      <div className="space-y-3">
        {filtered.map((emp) => (
          <EmployeeHeatmapCard key={emp.id} employee={emp} />
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            当前筛选条件下没有员工记录
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeeHeatmapCard({ employee }: { employee: HeatmapEmployee }) {
  const campusBadgeClass = employee.campus === "武汉总部"
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      {/* 员工信息行 */}
      <div className="flex items-center gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white", employee.avatarColor)}>
          {employee.name[0]}
        </div>
        <span className="font-medium text-sm">{employee.name}</span>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[11px]">
          {employee.campus}
        </Badge>
        <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 text-[11px]">
          {employee.positionType}
        </Badge>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[11px]">
          {employee.anomalyCount}项异常
        </Badge>
        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
      </div>

      {/* 日历热力图 */}
      <div className="flex flex-wrap gap-1.5">
        {employee.days.map((day) => {
          const style = dayStyleMap[day.status];
          return (
            <Tooltip key={day.day}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium cursor-default transition-colors hover:ring-1 hover:ring-primary/30",
                    style.bg,
                    style.text,
                  )}
                >
                  {String(day.day).padStart(2, "0")}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <div className="space-y-0.5">
                  <div className="font-medium">4月{day.day}日</div>
                  {day.clockIn && <div>上班: {day.clockIn}</div>}
                  {day.clockOut && <div>下班: {day.clockOut}</div>}
                  {day.aiTip && <div className="text-violet-400">AI: {day.aiTip}</div>}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
