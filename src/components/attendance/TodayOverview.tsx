/**
 * Tab 1: 今日概览 — Dashboard
 * [BACKEND] 所有数据由后端 API 提供
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, MoreHorizontal, ArrowUpRight, CheckCircle2, MessageSquare,
  TrendingUp, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  todayExceptions, anomalyTrend, campusDistribution, rulesSummary,
  type ExceptionRow, type ExceptionStatus, type ExceptionType,
} from "@/mocks/attendance";

const exceptionTypeStyle: Record<ExceptionType, string> = {
  迟到: "bg-amber-100 text-amber-700 border-amber-200",
  早退: "bg-orange-100 text-orange-700 border-orange-200",
  缺卡: "bg-red-100 text-red-700 border-red-200",
  旷工: "bg-red-100 text-red-700 border-red-200",
};

const statusLabel: Record<ExceptionStatus, string> = {
  pending: "待处理", "waiting-employee": "待员工补充", approving: "待审批", done: "已处理",
};
const statusStyle: Record<ExceptionStatus, string> = {
  pending: "bg-muted text-foreground border-border",
  "waiting-employee": "bg-amber-50 text-amber-700 border-amber-200",
  approving: "bg-blue-50 text-blue-700 border-blue-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function TodayOverview({ onSwitchTab }: { onSwitchTab: (tab: string) => void }) {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const rows = useMemo(() => todayExceptions.map((r) =>
    doneIds.has(r.id) ? { ...r, status: "done" as ExceptionStatus } : r,
  ), [doneIds]);

  const filtered = rows.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const handleMarkDone = (id: string, name: string) => {
    setDoneIds((prev) => new Set(prev).add(id));
    toast.success(`${name} 的异常已标记为已处理`);
  };

  // KPI
  const kpis = [
    { label: "今日待处理异常", value: "5", sub: "较昨日 +2", color: "text-red-600" },
    { label: "本月加班总时长", value: "186 小时", sub: "", color: "text-foreground" },
    { label: "本月调休申请", value: "12 条", sub: "", color: "text-foreground" },
    { label: "本月预计补贴", value: "¥8,450", sub: "", color: "text-foreground" },
  ];

  // Mini trend chart (simple SVG)
  const maxTrend = Math.max(...anomalyTrend.map((t) => t.count), 1);
  const trendPoints = anomalyTrend.map((t, i) => {
    const x = (i / 29) * 100;
    const y = 100 - (t.count / maxTrend) * 80;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-6">
      {/* KPI 卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={cn("text-2xl font-bold mt-1", kpi.color)}>{kpi.value}</p>
              {kpi.sub && <p className="text-xs text-red-500 mt-0.5">{kpi.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 主区域：异常列表 + 侧边栏 */}
      <div className="flex gap-4">
        {/* 异常待办列表 */}
        <Card className="flex-[65] shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">今日异常列表</CardTitle>
                <CardDescription>需要处理的考勤异常记录</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="迟到">迟到</SelectItem>
                    <SelectItem value="早退">早退</SelectItem>
                    <SelectItem value="缺卡">缺卡</SelectItem>
                    <SelectItem value="旷工">旷工</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="pending">待处理</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">员工</TableHead>
                  <TableHead>考勤组</TableHead>
                  <TableHead>打卡时间</TableHead>
                  <TableHead>异常类型</TableHead>
                  <TableHead>AI建议</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="pr-6 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {row.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{row.name}</div>
                          <div className="text-xs text-muted-foreground">{row.dept} · {row.position}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.group}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div>上班 {row.clockIn}</div>
                      <div>下班 {row.clockOut}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-normal", exceptionTypeStyle[row.type])}>
                        {row.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                        <span>{row.aiSuggestion}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-normal", statusStyle[row.status])}>
                        {statusLabel[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => navigate(`/attendance/exception/${row.id}`)}>
                            <ArrowUpRight className="mr-2 h-4 w-4" />查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkDone(row.id, row.name)} disabled={row.status === "done"}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />标记已处理
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toast(`已通过钉钉发起与 ${row.name} 的会话`)}>
                            <MessageSquare className="mr-2 h-4 w-4" />联系员工
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      当前筛选条件下没有异常记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t px-6 py-3">
              <span className="text-xs text-muted-foreground">共 {rows.length} 条异常记录</span>
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => onSwitchTab("detail")}>
                查看全部 <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 右侧辅助卡片 */}
        <div className="flex-[35] space-y-4">
          {/* 异常趋势 */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                本月异常趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <svg viewBox="0 0 100 100" className="h-24 w-full" preserveAspectRatio="none">
                <polyline
                  points={trendPoints}
                  fill="none"
                  stroke="hsl(231 75% 58%)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>1日</span><span>15日</span><span>30日</span>
              </div>
            </CardContent>
          </Card>

          {/* 厂区分布 */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">厂区异常分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-6">
                {/* Simple donut via SVG */}
                <svg viewBox="0 0 36 36" className="h-20 w-20">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#F59E0B" strokeWidth="4"
                    strokeDasharray={`${58} ${100 - 58}`} strokeDashoffset="25" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#6366F1" strokeWidth="4"
                    strokeDasharray={`${42} ${100 - 42}`} strokeDashoffset={`${25 + 58}`} />
                </svg>
                <div className="space-y-2 text-xs">
                  {campusDistribution.map((c) => (
                    <div key={c.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-muted-foreground">{c.name}</span>
                      <span className="font-medium">{c.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 规则引擎状态 */}
          <Card className="shadow-sm cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onSwitchTab("rules")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                规则引擎状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rulesSummary.map((name) => (
                  <div key={name} className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">{name}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-primary">5 条规则全部运行中 →</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
