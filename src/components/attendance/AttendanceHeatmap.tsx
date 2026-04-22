/**
 * Tab 2: 考勤明细 — 全员月度热力图 + 筛选高亮 + 展开明细
 * [BACKEND] 热力图数据由后端 API 提供
 */
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Search, Download, ChevronRight, ChevronDown, Filter, X, ArrowRight, ChevronsUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { heatmapEmployees, type Campus, type DayStatus, type HeatmapEmployee } from "@/mocks/attendance";
import EmployeeDetailCard from "./EmployeeDetailCard";
import LeaveBalanceDrawer from "./LeaveBalanceDrawer";

const campusOptions: (Campus | "全部厂区")[] = ["全部厂区", "武汉总部", "鄂州工厂"];

type StatusFilterKey = "全部" | "异常" | "加班" | "请假" | "调休";
const statusOptions: StatusFilterKey[] = ["全部", "异常", "加班", "请假", "调休"];

const dayStyleMap: Record<DayStatus, { bg: string; text: string; border: string }> = {
  normal:   { bg: "bg-emerald-50",  text: "text-emerald-600", border: "border-emerald-300" },
  late:     { bg: "bg-amber-50",    text: "text-amber-600",   border: "border-amber-400" },
  overtime: { bg: "bg-violet-50",   text: "text-violet-600",  border: "border-violet-400" },
  leave:    { bg: "bg-red-50",      text: "text-red-600",     border: "border-red-400" },
  dayoff:   { bg: "bg-blue-50",     text: "text-blue-600",    border: "border-blue-400" },
  weekend:  { bg: "bg-muted",       text: "text-muted-foreground", border: "border-border" },
};

// Which day statuses match each filter
const filterMatchMap: Record<StatusFilterKey, DayStatus[]> = {
  "全部":  [],
  "异常":  ["late", "leave"],
  "加班":  ["overtime"],
  "请假":  ["leave"],
  "调休":  ["dayoff"],
};

// Compute filter counts from data
function computeCounts(employees: HeatmapEmployee[]) {
  let abnormal = 0, overtime = 0, leave = 0, dayoff = 0, total = 0;
  for (const emp of employees) {
    for (const d of emp.days) {
      total++;
      if (d.status === "late") abnormal++;
      if (d.status === "leave") { abnormal++; leave++; }
      if (d.status === "overtime") overtime++;
      if (d.status === "dayoff") dayoff++;
    }
  }
  return {
    "全部": total,
    "异常": abnormal,
    "加班": overtime,
    "请假": leave,
    "调休": dayoff,
  };
}

// Summary text per filter
function getSummary(filter: StatusFilterKey, employees: HeatmapEmployee[]) {
  const counts = computeCounts(employees);
  const affectedCount = employees.filter(e =>
    e.days.some(d => filterMatchMap[filter].includes(d.status))
  ).length;

  switch (filter) {
    case "异常": {
      // find peak anomaly day
      const dayCount: Record<number, number> = {};
      for (const emp of employees) {
        for (const d of emp.days) {
          if (d.status === "late" || d.status === "leave") {
            dayCount[d.day] = (dayCount[d.day] || 0) + 1;
          }
        }
      }
      const peakDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
      return `当前筛选：异常打卡｜共 ${counts["异常"]} 条，涉及 ${affectedCount} 名员工｜本月异常高峰：4月${peakDay?.[0]}日（${peakDay?.[1]}人）`;
    }
    case "加班": {
      const totalHours = employees.reduce((s, e) => s + e.stats.overtimeHours, 0);
      return `当前筛选：加班记录｜共 ${counts["加班"]} 条｜总时长 ${totalHours} 小时｜预计补贴 ¥${totalHours * 18}`;
    }
    case "请假":
      return `当前筛选：请假记录｜共 ${counts["请假"]} 条｜事假 ${Math.ceil(counts["请假"] * 0.58)} 条 / 病假 ${Math.ceil(counts["请假"] * 0.25)} 条 / 年假 ${counts["请假"] - Math.ceil(counts["请假"] * 0.58) - Math.ceil(counts["请假"] * 0.25)} 条`;
    case "调休":
      return `当前筛选：调休记录｜共 ${counts["调休"]} 条｜已使用 ${Math.ceil(counts["调休"] * 0.6)} 条 / 待审批 ${counts["调休"] - Math.ceil(counts["调休"] * 0.6)} 条`;
    default:
      return "";
  }
}

export default function AttendanceHeatmap() {
  const [search, setSearch] = useState("");
  const [campus, setCampus] = useState<Campus | "全部厂区">("全部厂区");
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>("全部");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [leaveDrawerOpen, setLeaveDrawerOpen] = useState(false);
  const expandRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const counts = useMemo(() => computeCounts(heatmapEmployees), []);

  // [FRONTEND-ONLY] Filter + sort employees
  const filtered = useMemo(() => {
    let list = heatmapEmployees.filter((e) => {
      if (search && !e.name.includes(search)) return false;
      if (campus !== "全部厂区" && e.campus !== campus) return false;
      if (statusFilter !== "全部") {
        const matchStatuses = filterMatchMap[statusFilter];
        if (matchStatuses.length > 0 && !e.days.some((d) => matchStatuses.includes(d.status))) return false;
      }
      return true;
    });

    // Sort by matching status count descending when filtered
    if (statusFilter !== "全部") {
      const matchStatuses = filterMatchMap[statusFilter];
      list = [...list].sort((a, b) => {
        const countA = a.days.filter(d => matchStatuses.includes(d.status)).length;
        const countB = b.days.filter(d => matchStatuses.includes(d.status)).length;
        return countB - countA;
      });
    }

    return list;
  }, [search, campus, statusFilter]);

  // Handle filter hiding expanded employees
  useEffect(() => {
    if (expandedIds.size === 0) return;
    const visibleIds = new Set(filtered.map(e => e.id));
    const hiddenExpanded = [...expandedIds].filter(id => !visibleIds.has(id));
    if (hiddenExpanded.length > 0) {
      setExpandedIds(prev => {
        const next = new Set(prev);
        hiddenExpanded.forEach(id => next.delete(id));
        return next;
      });
      toast.info(`${hiddenExpanded.length} 名已展开员工被筛选隐藏，清除筛选可恢复`);
    }
  }, [filtered, expandedIds]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Scroll to expanded card after render
        requestAnimationFrame(() => {
          const el = expandRefs.current[id];
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: "smooth" });
          }
        });
      }
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const clearFilter = useCallback(() => {
    setStatusFilter("全部");
  }, []);

  const summaryText = useMemo(() => getSummary(statusFilter, filtered), [statusFilter, filtered]);

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
              className={cn("h-8 text-xs transition-all duration-100 active:scale-95",
                campus === c && "bg-primary text-primary-foreground"
              )}
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
              className={cn(
                "h-8 text-xs relative transition-all duration-100 active:scale-95 pr-8",
                statusFilter === s
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-primary/5 hover:text-primary"
              )}
              onClick={() => setStatusFilter(s)}
            >
              {s}
              <span className={cn(
                "absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center px-1 font-medium",
                statusFilter === s
                  ? "bg-primary-foreground text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {counts[s]}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* 摘要条 */}
      {statusFilter !== "全部" && (
        <div className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm"
          style={{ backgroundColor: "hsl(var(--primary-soft))" }}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span>{summaryText}</span>
          </div>
          <div className="flex items-center gap-2">
            {statusFilter === "加班" && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                查看加班明细 <ArrowRight className="h-3 w-3" />
              </Button>
            )}
            {statusFilter === "调休" && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary" onClick={() => setLeaveDrawerOpen(true)}>
                管理调休余额 <ArrowRight className="h-3 w-3" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={clearFilter}>
              清除筛选 <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* 全部收起浮动按钮 */}
      {expandedIds.size >= 2 && (
        <div className="sticky top-0 z-20 flex justify-end">
          <Button variant="outline" size="sm" onClick={collapseAll} className="gap-1.5 text-xs shadow-md bg-card">
            <ChevronsUp className="h-3.5 w-3.5" />
            全部收起（已展开 {expandedIds.size} 人）
          </Button>
        </div>
      )}

      {/* 员工热力图列表 */}
      <div className="space-y-3">
        {filtered.map((emp) => {
          const isExpanded = expandedIds.has(emp.id);
          return (
            <div key={emp.id} ref={el => { expandRefs.current[emp.id] = el; }}>
              <EmployeeHeatmapCard
                employee={emp}
                isExpanded={isExpanded}
                statusFilter={statusFilter}
                onToggleExpand={() => toggleExpand(emp.id)}
              />
              {isExpanded && (
                <div className="mt-2">
                  <EmployeeDetailCard
                    employee={emp}
                    activeFilter={statusFilter}
                    onCollapse={() => toggleExpand(emp.id)}
                    onOpenLeaveBalance={() => setLeaveDrawerOpen(true)}
                  />
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            当前筛选条件下没有员工记录
          </div>
        )}
      </div>

      <LeaveBalanceDrawer open={leaveDrawerOpen} onOpenChange={setLeaveDrawerOpen} />
    </div>
  );
}

function EmployeeHeatmapCard({
  employee,
  isExpanded,
  statusFilter,
  onToggleExpand,
}: {
  employee: HeatmapEmployee;
  isExpanded: boolean;
  statusFilter: StatusFilterKey;
  onToggleExpand: () => void;
}) {
  const matchStatuses = filterMatchMap[statusFilter];
  const isFiltering = statusFilter !== "全部";

  return (
    <div className={cn(
      "rounded-xl border bg-card p-4 space-y-3 transition-colors duration-200",
      isExpanded && "bg-[hsl(245_50%_99%)] border-primary/30"
    )}>
      {/* 员工信息行 */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white",
          employee.avatarColor
        )}>
          {employee.name[0]}
        </div>
        <span className="font-medium text-sm">{employee.name}</span>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[11px]">
          {employee.campus}
        </Badge>
        <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 text-[11px]">
          {employee.positionType}
        </Badge>
        <Badge variant="outline" className={cn(
          "bg-red-50 text-red-700 border-red-200 text-[11px] transition-all",
          isFiltering && statusFilter === "异常" && "ring-2 ring-primary/50"
        )}>
          {employee.anomalyCount}项异常
        </Badge>
        <button
          onClick={onToggleExpand}
          className={cn(
            "ml-auto flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200",
            "hover:bg-muted",
            isExpanded ? "text-primary bg-primary/5" : "text-muted-foreground"
          )}
        >
          {isExpanded
            ? <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            : <ChevronRight className="h-4 w-4 transition-transform duration-200 hover:text-primary" />
          }
        </button>
      </div>

      {/* 日历热力图 */}
      <div className="flex flex-wrap gap-1.5">
        {employee.days.map((day) => {
          const style = dayStyleMap[day.status];
          const isMatch = !isFiltering || matchStatuses.includes(day.status);
          const shouldHighlight = isFiltering && isMatch;
          const shouldDim = isFiltering && !isMatch;

          return (
            <Tooltip key={day.day}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium cursor-default transition-all duration-300",
                    style.bg,
                    style.text,
                    shouldHighlight && "scale-105 border-2 ring-0",
                    shouldHighlight && style.border,
                    shouldDim && "opacity-30 grayscale",
                    !isFiltering && "hover:ring-1 hover:ring-primary/30",
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
