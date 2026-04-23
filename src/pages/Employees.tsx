import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileWarning,
  IdCard,
  RefreshCcw,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  X,
  CircleDot,
  Paperclip,
  GitCompare,
  ArrowDownToLine,
  FileUp,
} from "lucide-react";
import { UpdateMaterialsDialog, type UpdateTarget } from "@/components/employees/UpdateMaterialsDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ContractStatus = "normal" | "soon" | "expired";
type IdStatus = "normal" | "soon" | "expired";
type EmployeeStatus = "active" | "leaving" | "pending";
type SyncStatus = "synced" | "pending" | "diff" | "failed";

interface DiffField {
  field: string;
  dingtalk: string;
  system: string;
}

interface EmployeeRow {
  id: string;
  name: string;
  status: EmployeeStatus;
  entity: string;
  department: string;
  position: string;
  hireDate: string;
  contractEnd: string;
  contractStatus: ContractStatus;
  idEnd: string;
  idStatus: IdStatus;
  completeness: number;
  lastChange: string;
  phone: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  diffs: DiffField[];
}

const ENTITY = "武汉三工光电设备制造有限公司";

const ENTITIES = ["光电", "光电（鄂）", "国际", "激光", "新能源", "新能源（鄂）", "其他"] as const;

const MOCK: EmployeeRow[] = [
  { id: "E001", name: "李明", status: "active", entity: "激光", department: "研发部", position: "高级激光工程师", hireDate: "2022-03-15", contractEnd: "2026-03-14", contractStatus: "normal", idEnd: "2031-08-12", idStatus: "normal", completeness: 100, lastChange: "转正", phone: "138****2381", syncStatus: "synced", lastSyncAt: "2025-04-15 09:32", diffs: [] },
  { id: "E002", name: "王芳", status: "active", entity: "光电", department: "市场营销部", position: "市场经理", hireDate: "2021-08-01", contractEnd: "2025-12-30", contractStatus: "soon", idEnd: "2029-04-22", idStatus: "normal", completeness: 100, lastChange: "部门变动", phone: "139****1102", syncStatus: "diff", lastSyncAt: "2025-04-16 14:21", diffs: [
    { field: "部门", dingtalk: "市场营销部 / 品牌组", system: "市场营销部" },
    { field: "手机号", dingtalk: "139****1108", system: "139****1102" },
  ]},
  { id: "E003", name: "张伟", status: "active", entity: "光电（鄂）", department: "商务部", position: "销售主管", hireDate: "2020-05-20", contractEnd: "2026-05-19", contractStatus: "normal", idEnd: "2025-12-15", idStatus: "soon", completeness: 75, lastChange: "岗位变动", phone: "137****6612", syncStatus: "diff", lastSyncAt: "2025-04-14 11:08", diffs: [
    { field: "现任职务", dingtalk: "销售总监", system: "销售主管" },
  ]},
  { id: "E004", name: "刘洋", status: "active", entity: "国际", department: "研发部", position: "前端开发", hireDate: "2023-01-10", contractEnd: "2026-01-09", contractStatus: "normal", idEnd: "2030-09-01", idStatus: "normal", completeness: 100, lastChange: "入职", phone: "186****8821", syncStatus: "synced", lastSyncAt: "2025-04-16 08:00", diffs: [] },
  { id: "E005", name: "陈静", status: "active", entity: "新能源", department: "研发部", position: "后端开发", hireDate: "2023-06-01", contractEnd: "2026-05-31", contractStatus: "normal", idEnd: "2032-02-18", idStatus: "normal", completeness: 75, lastChange: "入职", phone: "159****3344", syncStatus: "pending", lastSyncAt: "—", diffs: [] },
  { id: "E006", name: "黄磊", status: "active", entity: "新能源（鄂）", department: "项目管理部", position: "产品经理", hireDate: "2022-11-15", contractEnd: "2025-11-14", contractStatus: "expired", idEnd: "2028-07-30", idStatus: "normal", completeness: 100, lastChange: "调岗", phone: "188****9092", syncStatus: "synced", lastSyncAt: "2025-04-15 16:45", diffs: [] },
  { id: "E007", name: "赵强", status: "active", entity: "激光", department: "生产管理部", position: "装配技师", hireDate: "2019-04-08", contractEnd: "2026-04-07", contractStatus: "normal", idEnd: "2025-11-20", idStatus: "soon", completeness: 80, lastChange: "续签", phone: "135****4471", syncStatus: "failed", lastSyncAt: "2025-04-15 10:12", diffs: [] },
  { id: "E008", name: "周敏", status: "active", entity: "光电", department: "财务中心", position: "会计主管", hireDate: "2018-09-12", contractEnd: "2027-09-11", contractStatus: "normal", idEnd: "2033-05-04", idStatus: "normal", completeness: 100, lastChange: "—", phone: "131****0908", syncStatus: "synced", lastSyncAt: "2025-04-16 09:00", diffs: [] },
];

const stats = [
  { key: "sync", label: "待同步钉钉", value: MOCK.filter(m => m.syncStatus === "pending" || m.syncStatus === "diff" || m.syncStatus === "failed").length, icon: ArrowDownToLine, accent: "text-primary bg-primary/10", primary: true },
  { key: "contract", label: "合同30天内到期", value: 3, icon: FileWarning, accent: "text-destructive bg-destructive/10" },
  { key: "id", label: "身份证30天内到期", value: 2, icon: IdCard, accent: "text-warning bg-warning/10" },
  { key: "missing", label: "资料缺失", value: MOCK.filter(m => m.completeness < 100).length, icon: AlertTriangle, accent: "text-muted-foreground bg-muted" },
];

const StatusBadge = ({ status }: { status: EmployeeStatus }) => {
  const map = {
    active: { label: "在职", cls: "bg-success/10 text-success border-success/20" },
    leaving: { label: "离职中", cls: "bg-warning/10 text-warning border-warning/20" },
    pending: { label: "待入职", cls: "bg-muted text-muted-foreground" },
  } as const;
  return <Badge variant="outline" className={cn("font-normal", map[status].cls)}>{map[status].label}</Badge>;
};

function SyncBadge({ status, time, diffs }: { status: SyncStatus; time: string; diffs: number }) {
  const map: Record<SyncStatus, { label: string; cls: string; dot: string }> = {
    synced: { label: "已同步", cls: "text-success", dot: "bg-success" },
    pending: { label: "待同步", cls: "text-muted-foreground", dot: "bg-muted-foreground" },
    diff: { label: `${diffs} 项差异`, cls: "text-warning", dot: "bg-warning" },
    failed: { label: "同步失败", cls: "text-destructive", dot: "bg-destructive" },
  };
  const m = map[status];
  return (
    <div className="flex flex-col gap-0.5 min-w-[110px]">
      <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", m.cls)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
        {m.label}
      </span>
      <span className="text-[11px] text-muted-foreground tabular-nums">{time}</span>
    </div>
  );
}

const ContractCell = ({ status }: { status: ContractStatus }) => {
  if (status === "expired") return <span className="inline-flex items-center gap-1 text-destructive text-xs"><AlertTriangle className="h-3 w-3" />已到期</span>;
  if (status === "soon") return <span className="inline-flex items-center gap-1 text-warning text-xs"><AlertTriangle className="h-3 w-3" />即将到期</span>;
  return <span className="text-success text-xs">正常</span>;
};
const IdCellC = ({ status }: { status: IdStatus }) => {
  if (status === "expired") return <span className="inline-flex items-center gap-1 text-destructive text-xs"><AlertTriangle className="h-3 w-3" />已到期</span>;
  if (status === "soon") return <span className="inline-flex items-center gap-1 text-warning text-xs"><AlertTriangle className="h-3 w-3" />即将到期</span>;
  return <span className="text-success text-xs">正常</span>;
};

export default function Employees() {
  const [tab, setTab] = useState("list");
  const [keyword, setKeyword] = useState("");
  const [department, setDepartment] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [contractFilter, setContractFilter] = useState<string>("all");
  const [statFilter, setStatFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [diffOpen, setDiffOpen] = useState<EmployeeRow | null>(null);
  const [updateTarget, setUpdateTarget] = useState<UpdateTarget | null>(null);

  const departments = [
    "财务中心",
    "供应链",
    "品质管理部",
    "生产管理部",
    "商务部",
    "市场营销部",
    "项目管理部",
    "研发部",
    "营销中心",
    "综合管理部",
    "物业",
  ];

  const filtered = useMemo(() => {
    return MOCK.filter((r) => {
      if (keyword) {
        const k = keyword.toLowerCase();
        if (![r.name, r.phone, r.department, r.position].some((v) => v.toLowerCase().includes(k))) return false;
      }
      if (department !== "all" && r.department !== department) return false;
      if (entityFilter !== "all" && r.entity !== entityFilter) return false;
      if (contractFilter !== "all" && r.contractStatus !== contractFilter) return false;
      if (statFilter === "contract" && r.contractStatus === "normal") return false;
      if (statFilter === "id" && r.idStatus === "normal") return false;
      if (statFilter === "missing" && r.completeness >= 100) return false;
      if (statFilter === "sync" && r.syncStatus === "synced") return false;
      return true;
    });
  }, [keyword, department, entityFilter, contractFilter, statFilter]);

  const toggleAll = (checked: boolean) => setSelected(checked ? filtered.map((r) => r.id) : []);
  const toggleOne = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const lastFullSync = "2025-04-16 14:21";
  const pendingCount = MOCK.filter(m => m.syncStatus !== "synced").length;

  return (
    <>
      <PageHeader
        title="员工档案管理"
        description="武汉三工光电 · 本系统负责同步、校验与归档"
        actions={
          <>
            <Button size="sm" onClick={() => toast.success("正在从钉钉同步员工信息…")}>
              <ArrowDownToLine className="h-4 w-4 mr-1.5" />从钉钉同步
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success(`已导出 ${filtered.length} 条`)}>
              <Download className="h-4 w-4 mr-1.5" />导出
            </Button>
          </>
        }
      />

      <div className="p-6 space-y-5">
        {/* 同步状态横幅 */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ArrowDownToLine className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="text-sm font-medium">钉钉数据同步</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                上次全量同步 <span className="tabular-nums">{lastFullSync}</span> · 当前 <span className="text-warning font-medium">{pendingCount}</span> 名员工待核对
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setStatFilter("sync"); toast.info("已筛选待核对员工"); }}>
                查看待核对
              </Button>
              <Button size="sm" onClick={() => toast.success("已触发全量同步")}>
                <RefreshCcw className="h-4 w-4 mr-1.5" />立即同步
              </Button>
            </div>
          </div>
        </Card>

        {/* 4 张统计卡 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const active = statFilter === s.key;
            const Icon = s.icon;
            return (
              <Card
                key={s.key}
                onClick={() => setStatFilter(active ? null : s.key)}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md flex items-center gap-3",
                  s.primary && "border-primary/30",
                  active && "ring-2 ring-primary"
                )}
              >
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", s.accent)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted-foreground truncate">{s.label}</div>
                  <div className="text-2xl font-semibold mt-0.5">{s.value}</div>
                </div>
              </Card>
            );
          })}
        </div>

        {statFilter && (
          <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
            已按「{stats.find((s) => s.key === statFilter)?.label}」过滤
            <button onClick={() => setStatFilter(null)} className="text-primary hover:underline inline-flex items-center gap-1">
              <X className="h-3 w-3" /> 清除
            </button>
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="list">员工列表</TabsTrigger>
            <TabsTrigger value="changes">异动记录</TabsTrigger>
            <TabsTrigger value="reminders">到期提醒</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <Card className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索姓名、手机号、部门、职务…"
                    className="pl-9"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="合同归属" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部合同归属</SelectItem>
                    {ENTITIES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="部门" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部部门</SelectItem>
                    {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={contractFilter} onValueChange={setContractFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="合同状态" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部合同状态</SelectItem>
                    <SelectItem value="normal">正常</SelectItem>
                    <SelectItem value="soon">即将到期</SelectItem>
                    <SelectItem value="expired">已到期</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => { setKeyword(""); setDepartment("all"); setEntityFilter("all"); setContractFilter("all"); setStatFilter(null); }}>
                  <Filter className="h-4 w-4 mr-1.5" />重置
                </Button>
              </div>

              {selected.length > 0 && (
                <div className="mt-3 flex items-center gap-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  已选 <span className="font-medium">{selected.length}</span> 名员工
                  <div className="flex-1" />
                  <Button size="sm" variant="outline" onClick={() => toast.success("已重新从钉钉同步")}>重新同步</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("已接受钉钉变更")}>接受钉钉变更</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("提醒已发送")}>提醒补资料</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelected([])}>取消</Button>
                </div>
              )}
            </Card>

            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border"
                        checked={selected.length > 0 && selected.length === filtered.length}
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                    </TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>现任职务</TableHead>
                    <TableHead>入职时间</TableHead>
                    <TableHead>钉钉同步</TableHead>
                    <TableHead>合同</TableHead>
                    <TableHead>身份证</TableHead>
                    <TableHead>资料</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/30">
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border"
                          checked={selected.includes(r.id)}
                          onChange={() => toggleOne(r.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to={`/employees/${r.id}`} className="font-medium hover:text-primary">{r.name}</Link>
                          </TooltipTrigger>
                          <TooltipContent>最近变动：{r.lastChange}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-sm">{r.department}</TableCell>
                      <TableCell className="text-sm">{r.position}</TableCell>
                      <TableCell className="text-muted-foreground text-sm tabular-nums">{r.hireDate}</TableCell>
                      <TableCell>
                        {r.syncStatus === "diff" ? (
                          <button
                            onClick={() => setDiffOpen(r)}
                            className="text-left hover:bg-warning/5 rounded px-1 -mx-1 transition-colors"
                          >
                            <SyncBadge status={r.syncStatus} time={r.lastSyncAt} diffs={r.diffs.length} />
                          </button>
                        ) : (
                          <SyncBadge status={r.syncStatus} time={r.lastSyncAt} diffs={r.diffs.length} />
                        )}
                      </TableCell>
                      <TableCell><ContractCell status={r.contractStatus} /></TableCell>
                      <TableCell><IdCellC status={r.idStatus} /></TableCell>
                      <TableCell>
                        {(() => {
                          const total = 4;
                          const done = Math.round((r.completeness / 100) * total);
                          return (
                            <div className="flex items-center gap-2 min-w-[110px]">
                              <Progress value={(done / total) * 100} className="h-1.5 flex-1" />
                              <span className={cn("text-xs tabular-nums", done < total ? "text-warning" : "text-success")}>
                                {done}/{total}
                              </span>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link to={`/employees/${r.id}`}>查看详情</Link></DropdownMenuItem>
                            {r.diffs.length > 0 && (
                              <DropdownMenuItem onClick={() => setDiffOpen(r)}>
                                <GitCompare className="h-4 w-4 mr-2" />查看差异
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => toast.success("已从钉钉同步最新")}>
                              <RefreshCcw className="h-4 w-4 mr-2" />从钉钉重新同步
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toast.success("已打开附件上传")}>
                              <Paperclip className="h-4 w-4 mr-2" />补录附件
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground py-10">没有匹配的员工</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="changes">
            <Card className="p-6">
              <div className="space-y-4">
                {[
                  { date: "2025-04-16 14:21", name: "王芳", type: "钉钉变更", desc: "部门：市场部 → 市场部 / 品牌组（钉钉同步）", op: "钉钉" },
                  { date: "2025-04-15 16:45", name: "黄磊", type: "钉钉变更", desc: "职务：产品经理 → 产品总监（钉钉同步）", op: "钉钉" },
                  { date: "2025-04-14 11:08", name: "张伟", type: "钉钉变更", desc: "现任职务：销售主管 → 销售总监", op: "钉钉" },
                  { date: "2025-04-10 09:00", name: "陈静", type: "入职", desc: "技术研发中心 · 后端开发（钉钉新建）", op: "钉钉" },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-4 border-l-2 border-primary/30 pl-4">
                    <div className="text-xs text-muted-foreground w-32 shrink-0 mt-0.5 tabular-nums">{c.date}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.name}</span>
                        <Badge variant={c.op === "钉钉" ? "default" : "secondary"} className={c.op === "钉钉" ? "bg-primary/10 text-primary hover:bg-primary/15" : ""}>
                          {c.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{c.desc} · 来源 {c.op}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reminders">
            <Card className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {MOCK.filter((m) => m.contractStatus !== "normal" || m.idStatus !== "normal").map((r) => (
                  <Card key={r.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/employees/${r.id}`} className="font-medium hover:text-primary">{r.name}</Link>
                        <div className="text-xs text-muted-foreground mt-0.5">{r.department} · {r.position}</div>
                      </div>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">需处理</Badge>
                    </div>
                    <div className="mt-3 space-y-1.5 text-sm">
                      {r.contractStatus !== "normal" && (
                        <div className="flex justify-between"><span className="text-muted-foreground">合同到期</span><span className={r.contractStatus === "expired" ? "text-destructive" : "text-warning"}>{r.contractEnd}</span></div>
                      )}
                      {r.idStatus !== "normal" && (
                        <div className="flex justify-between"><span className="text-muted-foreground">身份证到期</span><span className="text-warning">{r.idEnd}</span></div>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toast.success("已通过钉钉发送提醒")}>
                        <CircleDot className="h-3.5 w-3.5 mr-1" />钉钉提醒员工
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          setUpdateTarget({
                            id: r.id,
                            name: r.name,
                            department: r.department,
                            position: r.position,
                            contractEnd: r.contractEnd,
                            contractStatus: r.contractStatus,
                            idEnd: r.idEnd,
                            idStatus: r.idStatus,
                          })
                        }
                      >
                        <FileUp className="h-3.5 w-3.5 mr-1" />资料更新
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 字段差异抽屉 */}
      <DiffSheet row={diffOpen} onClose={() => setDiffOpen(null)} />

      {/* 资料更新弹窗 */}
      <UpdateMaterialsDialog
        target={updateTarget}
        open={!!updateTarget}
        onClose={() => setUpdateTarget(null)}
      />
    </>
  );
}

function DiffSheet({ row, onClose }: { row: EmployeeRow | null; onClose: () => void }) {
  const [decisions, setDecisions] = useState<Record<string, "accept" | "reject" | undefined>>({});

  if (!row) return null;

  const handleDecision = (field: string, d: "accept" | "reject") => {
    setDecisions((s) => ({ ...s, [field]: d }));
  };

  const handleApply = () => {
    const accepted = row.diffs.filter((d) => decisions[d.field] === "accept").length;
    toast.success(`已接受 ${accepted} 项钉钉变更，并写入档案`);
    onClose();
    setDecisions({});
  };

  return (
    <Sheet open={!!row} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-warning" />
            {row.name} · 字段差异核对
          </SheetTitle>
          <SheetDescription>
            钉钉于 <span className="tabular-nums">{row.lastSyncAt}</span> 同步到变更，请逐项确认是否写入员工档案。
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {row.diffs.map((d) => {
            const dec = decisions[d.field];
            return (
              <Card key={d.field} className={cn(
                "p-4 transition-colors",
                dec === "accept" && "border-success/40 bg-success/5",
                dec === "reject" && "border-muted bg-muted/30 opacity-70"
              )}>
                <div className="text-sm font-medium mb-3">{d.field}</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5">
                    <div className="text-[10px] text-primary mb-1 uppercase tracking-wide">钉钉值</div>
                    <div className="font-medium">{d.dingtalk}</div>
                  </div>
                  <div className="rounded-md border bg-muted/40 p-2.5">
                    <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">系统值</div>
                    <div className="font-medium">{d.system}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant={dec === "accept" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleDecision(d.field, "accept")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />采用钉钉值
                  </Button>
                  <Button
                    size="sm"
                    variant={dec === "reject" ? "secondary" : "outline"}
                    className="flex-1"
                    onClick={() => handleDecision(d.field, "reject")}
                  >
                    暂不更新
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>稍后处理</Button>
          <Button
            className="flex-1"
            disabled={Object.keys(decisions).length === 0}
            onClick={handleApply}
          >
            应用变更
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
