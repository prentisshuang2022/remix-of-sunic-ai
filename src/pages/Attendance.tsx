import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  Repeat2,
  MoreHorizontal,
  Upload,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { DateRangeFilter, type DateFilterValue } from "@/components/attendance/DateRangeFilter";
import { cn } from "@/lib/utils";

// ---------- mock 数据 ----------

type ExceptionStatus = "pending" | "waiting-employee" | "approving" | "done";
type ExceptionType = "迟到" | "早退" | "缺卡" | "旷工";

interface ExceptionRow {
  id: string;
  name: string;
  initial: string;
  dept: string;
  position: string;
  group: string;
  clockIn: string;
  clockOut: string;
  type: ExceptionType;
  aiSuggestion: string;
  status: ExceptionStatus;
}

const exceptionRows: ExceptionRow[] = [
  {
    id: "E001",
    name: "李明",
    initial: "李明",
    dept: "研发部",
    position: "高级工程师",
    group: "总部考勤组",
    clockIn: "09:35",
    clockOut: "18:30",
    type: "迟到",
    aiSuggestion: "无请假记录，建议发起补卡申请",
    status: "pending",
  },
  {
    id: "E002",
    name: "王芳",
    initial: "王芳",
    dept: "市场部",
    position: "市场经理",
    group: "总部考勤组",
    clockIn: "09:00",
    clockOut: "—",
    type: "缺卡",
    aiSuggestion: "存在请假审批，建议核销",
    status: "pending",
  },
  {
    id: "E003",
    name: "张伟",
    initial: "张伟",
    dept: "销售部",
    position: "销售总监",
    group: "外勤考勤组",
    clockIn: "—",
    clockOut: "—",
    type: "旷工",
    aiSuggestion: "无任何审批记录，建议联系确认",
    status: "waiting-employee",
  },
  {
    id: "E004",
    name: "赵六",
    initial: "赵六",
    dept: "产品部",
    position: "产品经理",
    group: "总部考勤组",
    clockIn: "08:55",
    clockOut: "17:30",
    type: "早退",
    aiSuggestion: "存在加班调休记录，建议核销",
    status: "approving",
  },
  {
    id: "E005",
    name: "钱七",
    initial: "钱七",
    dept: "运营部",
    position: "运营专员",
    group: "总部考勤组",
    clockIn: "09:10",
    clockOut: "18:00",
    type: "迟到",
    aiSuggestion: "疑似漏打卡，有门禁记录 08:58",
    status: "pending",
  },
];

type OvertimeStatus = "pending" | "approved" | "rejected";

interface OvertimeRow {
  id: string;
  name: string;
  dept: string;
  position: string;
  group: string;
  date: string;
  clockIn: string;
  clockOut: string;
  abnormal: "加班" | "调休" | "正常";
  isOvertime: "是" | "否";
  workHours: number;
  subsidyType: "餐补" | "调休" | "金额" | "—";
  subsidyValue: string;
  remark: string;
  status: OvertimeStatus;
}

const overtimeRows: OvertimeRow[] = [
  // 职能部门：餐补 / 调休时数（无金额）
  {
    id: "O001",
    name: "李明",
    dept: "职能部门",
    position: "高级工程师",
    group: "总部考勤组",
    date: "2026-04-14",
    clockIn: "08:30",
    clockOut: "20:30",
    abnormal: "加班",
    isOvertime: "是",
    workHours: 10,
    subsidyType: "餐补",
    subsidyValue: "—",
    remark: "—",
    status: "pending",
  },
  {
    id: "O002",
    name: "王芳",
    dept: "职能部门",
    position: "算法工程师",
    group: "总部考勤组",
    date: "2026-04-12",
    clockIn: "08:30",
    clockOut: "17:30",
    abnormal: "加班",
    isOvertime: "是",
    workHours: 8,
    subsidyType: "调休",
    subsidyValue: "8",
    remark: "—",
    status: "pending",
  },
  {
    id: "O003",
    name: "张伟",
    dept: "职能部门",
    position: "产品经理",
    group: "总部考勤组",
    date: "2026-04-13",
    clockIn: "08:30",
    clockOut: "20:30",
    abnormal: "加班",
    isOvertime: "是",
    workHours: 10,
    subsidyType: "调休",
    subsidyValue: "8",
    remark: "—",
    status: "pending",
  },
  // 生产一线：金额补贴 + 工时
  {
    id: "O101",
    name: "李明",
    dept: "生产一线",
    position: "仓管员",
    group: "生产考勤组",
    date: "2026-04-14",
    clockIn: "08:30",
    clockOut: "20:30",
    abnormal: "加班",
    isOvertime: "是",
    workHours: 10,
    subsidyType: "金额",
    subsidyValue: "36元",
    remark: "—",
    status: "pending",
  },
  {
    id: "O102",
    name: "赵六",
    dept: "生产一线",
    position: "组装工",
    group: "生产考勤组",
    date: "2026-04-14",
    clockIn: "08:30",
    clockOut: "20:30",
    abnormal: "加班",
    isOvertime: "是",
    workHours: 10,
    subsidyType: "金额",
    subsidyValue: "36元",
    remark: "—",
    status: "pending",
  },
  {
    id: "O103",
    name: "钱七",
    dept: "生产一线",
    position: "质检员",
    group: "生产考勤组",
    date: "2026-04-14",
    clockIn: "08:30",
    clockOut: "20:30",
    abnormal: "加班",
    isOvertime: "是",
    workHours: 10,
    subsidyType: "金额",
    subsidyValue: "36元",
    remark: "—",
    status: "pending",
  },
];

// ---------- 通用样式 ----------

const exceptionTypeStyle: Record<ExceptionType, string> = {
  迟到: "bg-amber-100 text-amber-700 border-amber-200",
  早退: "bg-amber-100 text-amber-700 border-amber-200",
  缺卡: "bg-red-100 text-red-700 border-red-200",
  旷工: "bg-red-100 text-red-700 border-red-200",
};

const statusLabel: Record<ExceptionStatus, string> = {
  pending: "待处理",
  "waiting-employee": "待员工补充",
  approving: "待审批",
  done: "已处理",
};

const statusStyle: Record<ExceptionStatus, string> = {
  pending: "bg-muted text-foreground border-border",
  "waiting-employee": "bg-amber-50 text-amber-700 border-amber-200",
  approving: "bg-blue-50 text-blue-700 border-blue-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const overtimeStatusLabel: Record<OvertimeStatus, string> = {
  pending: "待处理",
  approved: "已核销",
  rejected: "已驳回",
};

const overtimeStatusStyle: Record<OvertimeStatus, string> = {
  pending: "bg-muted text-foreground border-border",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

// ---------- 组件 ----------

export default function Attendance() {
  const [tab, setTab] = useState<"exceptions" | "overtime">("exceptions");

  return (
    <div className="flex flex-col">
      <PageHeader
        title="考勤助手"
        description="今日考勤异常概览与处理中心"
      />

      <div className="p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-6">
          <TabsList className="h-auto bg-transparent p-0 border-b w-full justify-start rounded-none gap-6">
            <TabsTrigger
              value="exceptions"
              className="gap-2 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <CalendarClock className="h-4 w-4" />
              考勤
            </TabsTrigger>
            <TabsTrigger
              value="overtime"
              className="gap-2 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Repeat2 className="h-4 w-4" />
              加班/调休
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exceptions" className="m-0">
            <ExceptionsPanel />
          </TabsContent>

          <TabsContent value="overtime" className="m-0">
            <OvertimePanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ---------- 考勤异常 Tab ----------

function ExceptionsPanel() {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ preset: "today" });
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    return exceptionRows.map((r) =>
      doneIds.has(r.id) ? { ...r, status: "done" as ExceptionStatus } : r,
    );
  }, [doneIds]);

  const filtered = rows.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const handleMarkDone = (id: string, name: string) => {
    setDoneIds((prev) => new Set(prev).add(id));
    toast.success(`${name} 的异常已标记为已处理`);
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-6">
        <div>
          <h2 className="text-base font-semibold">今日异常列表</h2>
          <p className="mt-1 text-xs text-muted-foreground">需要处理的考勤异常记录</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue placeholder="全部类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="迟到">迟到</SelectItem>
              <SelectItem value="早退">早退</SelectItem>
              <SelectItem value="缺卡">缺卡</SelectItem>
              <SelectItem value="旷工">旷工</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待处理</SelectItem>
              <SelectItem value="waiting-employee">待员工补充</SelectItem>
              <SelectItem value="approving">待审批</SelectItem>
              <SelectItem value="done">已处理</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4">
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
                      {row.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{row.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.dept} · {row.position}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.group}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <div>上班: {row.clockIn}</div>
                  <div>下班: {row.clockOut}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-normal", exceptionTypeStyle[row.type])}>
                    {row.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
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
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleMarkDone(row.id, row.name)}
                        disabled={row.status === "done"}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        标记已处理
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toast(`已通过钉钉发起与 ${row.name} 的会话`)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        联系员工
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
      </div>

      <div className="flex items-center justify-between border-t px-6 py-4">
        <span className="text-xs text-muted-foreground">共 {rows.length} 条异常记录</span>
        <Button variant="outline" size="sm" className="gap-1">
          查看全部
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ---------- 加班 / 调休 Tab ----------

function OvertimePanel() {
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ preset: "today" });
  const [deptFilter, setDeptFilter] = useState<string>("职能部门");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  // 职能部门不展示「工时」列；生产一线 / 全部部门 展示
  const showWorkHours = deptFilter !== "职能部门";

  const rows = useMemo(() => {
    return overtimeRows.map((r) =>
      approvedIds.has(r.id) ? { ...r, status: "approved" as OvertimeStatus } : r,
    );
  }, [approvedIds]);

  const filtered = rows.filter((r) => {
    if (deptFilter !== "all" && r.dept !== deptFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const handleApprove = (id: string, name: string) => {
    setApprovedIds((prev) => new Set(prev).add(id));
    toast.success(`${name} 的加班/调休记录已核销`);
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-6">
        <div>
          <h2 className="text-base font-semibold">今日异常列表</h2>
          <p className="mt-1 text-xs text-muted-foreground">需要处理的加班/调休记录</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
            <Upload className="h-3.5 w-3.5" />
            上传数据
          </Button>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue placeholder="全部部门" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部部门</SelectItem>
              <SelectItem value="职能部门">职能部门</SelectItem>
              <SelectItem value="生产一线">生产一线</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待处理</SelectItem>
              <SelectItem value="approved">已核销</SelectItem>
              <SelectItem value="rejected">已驳回</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">员工</TableHead>
              <TableHead>考勤组</TableHead>
              <TableHead>日期</TableHead>
              <TableHead>上/下班打卡时间</TableHead>
              <TableHead>打卡异常情况</TableHead>
              <TableHead>是否加班</TableHead>
              {showWorkHours && <TableHead>工时</TableHead>}
              <TableHead>加班补贴类型</TableHead>
              <TableHead>补贴内容</TableHead>
              <TableHead>备注</TableHead>
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
                      {row.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{row.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.dept} · {row.position}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.group}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.date}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <div>上班: {row.clockIn}</div>
                  <div>下班: {row.clockOut}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-amber-200 bg-amber-100 font-normal text-amber-700">
                    {row.abnormal}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{row.isOvertime}</TableCell>
                {showWorkHours && (
                  <TableCell className="text-sm">
                    {row.dept === "生产一线" ? row.workHours : "—"}
                  </TableCell>
                )}
                <TableCell className="text-sm text-muted-foreground">{row.subsidyType}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.subsidyValue}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.remark}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-normal", overtimeStatusStyle[row.status])}>
                    {overtimeStatusLabel[row.status]}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem onClick={() => toast(`查看 ${row.name} 的加班详情（${row.date}）`)}>
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleApprove(row.id, row.name)}
                        disabled={row.status === "approved"}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        标记已处理
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toast(`已通过钉钉发起与 ${row.name} 的会话`)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        联系员工
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={showWorkHours ? 12 : 11} className="py-12 text-center text-sm text-muted-foreground">
                  当前筛选条件下没有记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t px-6 py-4">
        <span className="text-xs text-muted-foreground">共 {rows.length} 条记录</span>
        <Button variant="outline" size="sm" className="gap-1">
          查看全部
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}

// ---------- 上传数据弹窗（mock） ----------

function UploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!fileName) {
      toast.error("请先选择要上传的文件");
      return;
    }
    onOpenChange(false);
    setFileName(null);
    toast.success(`${fileName} 已上传，AI 正在解析加班/调休数据`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>上传加班/调休数据</DialogTitle>
          <DialogDescription>
            支持 Excel、CSV 文件，AI 将自动识别员工、日期、工时与补贴信息
          </DialogDescription>
        </DialogHeader>

        <label
          htmlFor="overtime-upload"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center transition-colors hover:bg-muted/50"
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <div className="text-sm font-medium">
            {fileName ?? "点击选择文件或拖拽到此处"}
          </div>
          <div className="text-xs text-muted-foreground">支持 .xlsx / .xls / .csv，单文件 ≤ 10MB</div>
          <input
            id="overtime-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm}>开始上传</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Re-export for backwards-compat with prior placeholder pages (no longer routed).
export { PlaceholderPage };
