import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Download,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { cn } from "@/lib/utils";

const stageList = [
  { key: "self", name: "员工自评", date: "04/01 - 04/10", status: "已完成" },
  { key: "leader", name: "直属上级考评", date: "04/11 - 04/20", status: "进行中" },
  { key: "dept", name: "部门负责人考评", date: "04/21 - 04/25", status: "进行中" },
  { key: "hr", name: "HR 汇总复核", date: "04/26 - 04/28", status: "未开始" },
  { key: "gm", name: "总经理确认", date: "04/29 - 04/30", status: "未开始" },
];

interface Row {
  id: string;
  name: string;
  dept: string;
  role: string;
  selfScore: number | null;
  leaderScore: number | null;
  deptScore: number | null;
  status: "已提交" | "待上级评" | "待部门评" | "超期" | "AI 异常";
  anomaly?: string;
}

const rows: Row[] = [
  { id: "E1001", name: "王 磊", dept: "生产管理部", role: "高级工艺工程师", selfScore: 88, leaderScore: 87, deptScore: null, status: "待部门评" },
  { id: "E1002", name: "李 雪", dept: "营销中心", role: "大客户经理", selfScore: 90, leaderScore: 72, deptScore: null, status: "AI 异常", anomaly: "自评-上级偏差 18 分，AI 建议复核" },
  { id: "E1003", name: "张 涛", dept: "研发部", role: "光学算法工程师", selfScore: 92, leaderScore: 92, deptScore: 91, status: "已提交" },
  { id: "E1004", name: "孙 玥", dept: "供应链", role: "采购主管", selfScore: 80, leaderScore: 65, deptScore: null, status: "AI 异常", anomaly: "上级评分与 ERP 成本数据不一致" },
  { id: "E1005", name: "陈 立", dept: "生产管理部", role: "装配技师", selfScore: null, leaderScore: null, deptScore: null, status: "超期" },
  { id: "E1006", name: "周 颖", dept: "研发部", role: "结构工程师", selfScore: 85, leaderScore: null, deptScore: null, status: "待上级评" },
  { id: "E1007", name: "吴 敏", dept: "品质管理部", role: "质量主管", selfScore: 86, leaderScore: 84, deptScore: null, status: "待部门评" },
  { id: "E1008", name: "黄 强", dept: "项目管理部", role: "项目经理", selfScore: 89, leaderScore: 88, deptScore: null, status: "待部门评" },
];

const statusTone: Record<Row["status"], string> = {
  已提交: "bg-emerald-50 text-emerald-700 border-emerald-200",
  待上级评: "bg-blue-50 text-blue-700 border-blue-200",
  待部门评: "bg-blue-50 text-blue-700 border-blue-200",
  超期: "bg-rose-50 text-rose-700 border-rose-200",
  "AI 异常": "bg-orange-50 text-orange-700 border-orange-200",
};

export default function PerformanceCycle() {
  const navigate = useNavigate();
  const { id = "2025Q2" } = useParams();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") === "anomaly" ? "anomaly" : "all");
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");

  const list = useMemo(() => {
    return rows.filter((r) => {
      if (tab === "anomaly" && r.status !== "AI 异常") return false;
      if (tab === "overdue" && r.status !== "超期") return false;
      if (dept !== "all" && r.dept !== dept) return false;
      if (search && !r.name.includes(search)) return false;
      return true;
    });
  }, [tab, dept, search]);

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`${id} 季度考核`}
        description="周期：2025-04-01 ~ 2025-06-30 · 模板「研发/生产/职能 V3.2」"
        backTo="/performance"
        backLabel="返回绩效助手"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success("已导出当前周期评估明细")}>
              <Download className="mr-1.5 h-4 w-4" />
              导出
            </Button>
            <Button size="sm" onClick={() => toast.success("已推送催办给所有未提交人员")}>
              <Bell className="mr-1.5 h-4 w-4" />
              全员催办
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-6">
        {/* 阶段时间线 */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold">流程阶段</h3>
          <div className="mt-4 flex items-center gap-2">
            {stageList.map((s, i) => (
              <div key={s.key} className="flex flex-1 items-center">
                <div className="flex flex-1 flex-col items-center text-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                      s.status === "已完成" && "border-emerald-500 bg-emerald-500 text-white",
                      s.status === "进行中" && "border-primary bg-primary text-primary-foreground",
                      s.status === "未开始" && "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {s.status === "已完成" ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <div className="mt-2 text-xs font-medium">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">{s.date}</div>
                </div>
                {i < stageList.length - 1 && (
                  <div className={cn("h-0.5 flex-1", s.status === "已完成" ? "bg-emerald-500" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* AI 异常提示 */}
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
          <div className="flex-1 text-xs">
            <div className="font-medium text-orange-900">
              AI 校验：发现 {rows.filter((r) => r.status === "AI 异常").length} 项分数异常 · {rows.filter((r) => r.status === "超期").length} 人超期未提交
            </div>
            <div className="mt-0.5 text-orange-800/80">
              AI 已比对自评、上级评分与业务系统达成数据，建议在进入 HR 汇总前完成复核。
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success("AI 已重新跑批校验")}>
            <Sparkles className="mr-1.5 h-4 w-4" />
            重新校验
          </Button>
        </div>

        {/* 名单 */}
        <Card className="p-5">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="all">全部 {rows.length}</TabsTrigger>
                <TabsTrigger value="anomaly">AI 异常 {rows.filter((r) => r.status === "AI 异常").length}</TabsTrigger>
                <TabsTrigger value="overdue">超期 {rows.filter((r) => r.status === "超期").length}</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="搜索姓名"
                    className="h-9 w-56 pl-8"
                  />
                </div>
                <Select value={dept} onValueChange={setDept}>
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部部门</SelectItem>
                    <SelectItem value="研发部">研发部</SelectItem>
                    <SelectItem value="生产管理部">生产管理部</SelectItem>
                    <SelectItem value="品质管理部">品质管理部</SelectItem>
                    <SelectItem value="项目管理部">项目管理部</SelectItem>
                    <SelectItem value="营销中心">营销中心</SelectItem>
                    <SelectItem value="商务部">商务部</SelectItem>
                    <SelectItem value="市场营销部">市场营销部</SelectItem>
                    <SelectItem value="供应链">供应链</SelectItem>
                    <SelectItem value="财务中心">财务中心</SelectItem>
                    <SelectItem value="综合管理部">综合管理部</SelectItem>
                    <SelectItem value="物业">物业</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={tab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>员工</TableHead>
                    <TableHead>部门 / 岗位</TableHead>
                    <TableHead>自评</TableHead>
                    <TableHead>上级</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>状态 / AI 提示</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.name}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div>{r.dept}</div>
                        <div className="text-[11px]">{r.role}</div>
                      </TableCell>
                      <TableCell>{r.selfScore ?? "—"}</TableCell>
                      <TableCell>{r.leaderScore ?? "—"}</TableCell>
                      <TableCell>{r.deptScore ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]", statusTone[r.status])}>
                          {r.status}
                        </Badge>
                        {r.anomaly && (
                          <div className="mt-1 text-[11px] text-orange-700">{r.anomaly}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/performance/form/${r.id}`)}
                        >
                          查看评估表
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
