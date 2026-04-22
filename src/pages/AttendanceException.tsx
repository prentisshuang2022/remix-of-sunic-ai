import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  MessageSquare,
  PanelRightOpen,
  Clock,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  AlertTriangle,
  FileCheck2,
  XCircle,
  Building2,
  IdCard,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ---------- mock 数据（与列表页保持一致的 ID 体系） ----------

interface ExceptionDetail {
  id: string;
  name: string;
  employeeNo: string;
  dept: string;
  position: string;
  phone: string;
  email: string;
  group: string;
  date: string;
  type: "迟到" | "早退" | "缺卡" | "旷工";
  scheduledIn: string;
  scheduledOut: string;
  actualIn: string;
  actualOut: string;
  location: string;
  aiSummary: string;
  aiSuggestion: string;
  aiConfidence: number;
  leaveRecords: {
    id: string;
    type: string;
    range: string;
    status: "approved" | "pending" | "rejected";
    approver: string;
  }[];
  punchRecords: {
    id: string;
    time: string;
    type: "上班打卡" | "下班打卡" | "门禁";
    location: string;
    status: "正常" | "异常";
  }[];
}

const mockDetail: Record<string, ExceptionDetail> = {
  E001: {
    id: "E001",
    name: "李明",
    employeeNo: "SW2023045",
    dept: "研发部",
    position: "高级工程师",
    phone: "138 0013 8000",
    email: "liming@example.com",
    group: "总部考勤组",
    date: "2026-04-18",
    type: "迟到",
    scheduledIn: "09:00",
    scheduledOut: "18:00",
    actualIn: "09:35",
    actualOut: "18:30",
    location: "总部 · 办公区",
    aiSummary: "员工于 09:35 打卡，较排班晚 35 分钟，且当日无任何请假/外出审批记录。",
    aiSuggestion: "建议发起补卡申请，并由直属主管确认是否计入迟到。",
    aiConfidence: 86,
    leaveRecords: [],
    punchRecords: [
      { id: "P1", time: "09:35", type: "上班打卡", location: "总部 · 办公区", status: "异常" },
      { id: "P2", time: "12:05", type: "门禁", location: "总部 · 西门", status: "正常" },
      { id: "P3", time: "18:30", type: "下班打卡", location: "总部 · 办公区", status: "正常" },
    ],
  },
};

const fallbackDetail: ExceptionDetail = {
  id: "—",
  name: "未知员工",
  employeeNo: "—",
  dept: "—",
  position: "—",
  phone: "—",
  email: "—",
  group: "—",
  date: "—",
  type: "迟到",
  scheduledIn: "—",
  scheduledOut: "—",
  actualIn: "—",
  actualOut: "—",
  location: "—",
  aiSummary: "未找到该异常记录的详细信息",
  aiSuggestion: "请返回列表选择有效的异常记录",
  aiConfidence: 0,
  leaveRecords: [],
  punchRecords: [],
};

// ---------- 样式映射 ----------

const typeStyle: Record<ExceptionDetail["type"], string> = {
  迟到: "bg-amber-100 text-amber-700 border-amber-200",
  早退: "bg-amber-100 text-amber-700 border-amber-200",
  缺卡: "bg-red-100 text-red-700 border-red-200",
  旷工: "bg-red-100 text-red-700 border-red-200",
};

const leaveStatusStyle: Record<"approved" | "pending" | "rejected", string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};
const leaveStatusLabel = { approved: "已通过", pending: "审批中", rejected: "已驳回" } as const;

// ---------- 组件 ----------

export default function AttendanceException() {
  const { id } = useParams<{ id: string }>();
  const detail = useMemo(() => (id && mockDetail[id]) || { ...fallbackDetail, id: id ?? "—" }, [id]);

  const [status, setStatus] = useState<"pending" | "done">("pending");
  const [note, setNote] = useState("");

  const handleAdopt = () => {
    setStatus("done");
    toast.success(`已采纳 AI 建议：${detail.aiSuggestion}`);
  };
  const handleMarkDone = () => {
    setStatus("done");
    toast.success(`${detail.name} 的异常已标记为已处理`);
  };
  const handleContact = () => {
    toast(`已通过钉钉发起与 ${detail.name} 的会话`);
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="异常处理详情"
        description={`${detail.date} · ${detail.name} · ${detail.type}`}
        backTo="/attendance"
        backLabel="返回考勤助手"
        actions={
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <PanelRightOpen className="h-3.5 w-3.5" />
                关联记录
              </Button>
            </SheetTrigger>
            <RelatedRecordsSheet detail={detail} />
          </Sheet>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        {/* 左：员工信息 */}
        <section className="rounded-xl border bg-card p-5 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-base font-medium text-muted-foreground">
              {detail.name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold">{detail.name}</div>
              <div className="text-xs text-muted-foreground">
                {detail.dept} · {detail.position}
              </div>
            </div>
            <Badge variant="outline" className={cn("ml-auto font-normal", typeStyle[detail.type])}>
              {detail.type}
            </Badge>
          </div>

          <Separator className="my-4" />

          <dl className="space-y-3 text-sm">
            <InfoRow icon={IdCard} label="员工编号" value={detail.employeeNo} />
            <InfoRow icon={Building2} label="考勤组" value={detail.group} />
            <InfoRow icon={Phone} label="电话" value={detail.phone} />
            <InfoRow icon={Mail} label="邮箱" value={detail.email} />
          </dl>
        </section>

        {/* 中+右：异常摘要 / AI 建议 / 处理动作 */}
        <section className="space-y-6 lg:col-span-2">
          {/* 异常事实 */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold">异常事实</h3>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FactCard label="排班时间" value={`${detail.scheduledIn} - ${detail.scheduledOut}`} />
              <FactCard
                label="实际打卡"
                value={`${detail.actualIn} - ${detail.actualOut}`}
                tone="warning"
              />
              <FactCard label="日期" value={detail.date} icon={CalendarDays} />
              <FactCard label="打卡地点" value={detail.location} icon={MapPin} />
            </div>
          </div>

          {/* AI 建议 */}
          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">AI 核验与建议</h3>
              </div>
              <Badge variant="outline" className="border-primary/30 bg-primary/10 font-normal text-primary">
                置信度 {detail.aiConfidence}%
              </Badge>
            </div>
            <p className="mt-3 text-sm text-foreground/80">{detail.aiSummary}</p>
            <div className="mt-3 rounded-lg border bg-card p-3 text-sm">
              <span className="text-xs font-medium text-muted-foreground">建议处理：</span>
              <span className="ml-1">{detail.aiSuggestion}</span>
            </div>
          </div>

          {/* 处理动作 */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">处理动作</h3>
              <Badge
                variant="outline"
                className={cn(
                  "font-normal",
                  status === "done"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-muted text-foreground border-border",
                )}
              >
                {status === "done" ? "已处理" : "待处理"}
              </Badge>
            </div>

            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="处理备注（选填，将记入处理日志）"
              className="mt-3 min-h-[80px] resize-none"
              disabled={status === "done"}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={handleAdopt} disabled={status === "done"} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                采纳 AI 建议
              </Button>
              <Button
                variant="outline"
                onClick={handleMarkDone}
                disabled={status === "done"}
                className="gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                标记已处理
              </Button>
              <Button variant="outline" onClick={handleContact} className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                联系员工
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------- 子组件 ----------

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IdCard;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <dt className="w-16 shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-sm">{value}</dd>
    </div>
  );
}

function FactCard({
  label,
  value,
  icon: Icon = Clock,
  tone = "default",
}: {
  label: string;
  value: string;
  icon?: typeof Clock;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone === "warning" ? "border-amber-200 bg-amber-50" : "bg-muted/30",
      )}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function RelatedRecordsSheet({ detail }: { detail: ExceptionDetail }) {
  return (
    <SheetContent className="w-full overflow-y-auto sm:max-w-md">
      <SheetHeader>
        <SheetTitle>关联记录</SheetTitle>
        <SheetDescription>
          {detail.date} · {detail.name} 的请假审批与当日打卡
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* 请假/审批 */}
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">请假/出差审批</h4>
          </div>
          <div className="mt-3 space-y-2">
            {detail.leaveRecords.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                <XCircle className="h-3.5 w-3.5" />
                当日无任何请假/出差/调休审批记录
              </div>
            ) : (
              detail.leaveRecords.map((r) => (
                <div key={r.id} className="rounded-lg border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{r.type}</span>
                    <Badge variant="outline" className={cn("font-normal", leaveStatusStyle[r.status])}>
                      {leaveStatusLabel[r.status]}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{r.range}</div>
                  <div className="mt-1 text-xs text-muted-foreground">审批人：{r.approver}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 当日打卡 */}
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">当日打卡记录</h4>
          </div>
          <div className="mt-3 space-y-2">
            {detail.punchRecords.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                <XCircle className="h-3.5 w-3.5" />
                当日暂无打卡记录
              </div>
            ) : (
              detail.punchRecords.map((p) => (
                <div key={p.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
                      p.status === "异常"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {p.time.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{p.type}</span>
                      <span className="text-xs text-muted-foreground">{p.time}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {p.location}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SheetContent>
  );
}
