import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Save, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface KPI {
  code: string;
  name: string;
  weight: number;
  target: string;
  achievement: string;
  source: string;
  selfScore: number;
  leaderScore: number;
  // AI 期望分数
  aiSuggested: number;
}

const initialKpis: KPI[] = [
  { code: "MF-021", name: "OEE 设备综合效率", weight: 30, target: "≥ 78%", achievement: "实际 81.2%", source: "MES", selfScore: 92, leaderScore: 90, aiSuggested: 92 },
  { code: "MF-007", name: "千件不良数 (PPM)", weight: 25, target: "≤ 320", achievement: "实际 285", source: "QMS", selfScore: 90, leaderScore: 88, aiSuggested: 91 },
  { code: "MF-014", name: "工时利用率", weight: 20, target: "≥ 85%", achievement: "实际 78%", source: "MES", selfScore: 88, leaderScore: 70, aiSuggested: 72 },
  { code: "GW-002", name: "团队协作与传帮带", weight: 15, target: "定性评估", achievement: "带教 2 名新员工", source: "上级评", selfScore: 90, leaderScore: 88, aiSuggested: 88 },
  { code: "GW-009", name: "安全与 6S", weight: 10, target: "0 事故", achievement: "0 事故 · 巡检 A", source: "EHS", selfScore: 95, leaderScore: 95, aiSuggested: 95 },
];

export default function PerformanceForm() {
  const { id = "E1001" } = useParams();
  const [kpis, setKpis] = useState(initialKpis);
  const [comment, setComment] = useState("本季度配合产线工艺优化，OEE 提升明显，但工时利用率受新机型投产影响略低于目标。");

  const update = (idx: number, key: "selfScore" | "leaderScore", v: number) => {
    setKpis((prev) => prev.map((k, i) => (i === idx ? { ...k, [key]: v } : k)));
  };

  const total = useMemo(() => {
    const self = kpis.reduce((s, k) => s + (k.selfScore * k.weight) / 100, 0);
    const leader = kpis.reduce((s, k) => s + (k.leaderScore * k.weight) / 100, 0);
    return { self: self.toFixed(1), leader: leader.toFixed(1) };
  }, [kpis]);

  const anomalies = kpis.filter((k) => Math.abs(k.leaderScore - k.aiSuggested) >= 10);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="绩效评估表"
        description="王磊 · 生产管理部 · 高级工艺工程师 · 2025 Q2"
        backTo="/performance/cycle/2025Q2"
        backLabel="返回周期名单"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success("草稿已保存")}>
              <Save className="mr-1.5 h-4 w-4" />
              保存草稿
            </Button>
            <Button size="sm" onClick={() => toast.success("已提交至部门负责人")}>
              <Send className="mr-1.5 h-4 w-4" />
              提交评估
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-6">
        {/* 汇总卡 */}
        <div className="grid gap-3 md:grid-cols-4">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">自评得分</div>
            <div className="mt-1 text-2xl font-semibold">{total.self}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">上级评分</div>
            <div className="mt-1 text-2xl font-semibold">{total.leader}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">AI 建议得分</div>
            <div className="mt-1 text-2xl font-semibold">
              {kpis.reduce((s, k) => s + (k.aiSuggested * k.weight) / 100, 0).toFixed(1)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">预计绩效系数</div>
            <div className="mt-1 text-2xl font-semibold">1.05</div>
            <div className="mt-1 text-[11px] text-muted-foreground">B+ · 入薪绩效</div>
          </Card>
        </div>

        {/* AI 校验 */}
        {anomalies.length > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
            <div className="flex-1 text-xs">
              <div className="font-medium text-orange-900">AI 校验提醒（{anomalies.length} 项偏差较大）</div>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-orange-800/80">
                {anomalies.map((a) => (
                  <li key={a.code}>
                    <span className="font-medium">{a.name}</span>：上级评分 {a.leaderScore}，业务系统达成对应建议 {a.aiSuggested}，差距 {Math.abs(a.leaderScore - a.aiSuggested)} 分
                  </li>
                ))}
              </ul>
            </div>
            <Button size="sm" variant="outline" onClick={() => toast.success("已采纳 AI 建议")}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              一键采纳
            </Button>
          </div>
        )}

        {/* KPI 表 */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">量化指标评估</h3>
            <span className="text-xs text-muted-foreground">达成数据由业务系统实时拉取，无需手动填写</span>
          </div>
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">指标</TableHead>
                <TableHead>权重</TableHead>
                <TableHead>目标</TableHead>
                <TableHead>达成 (来源)</TableHead>
                <TableHead className="w-[110px]">自评</TableHead>
                <TableHead className="w-[110px]">上级</TableHead>
                <TableHead className="w-[100px]">AI 建议</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpis.map((k, i) => {
                const diff = Math.abs(k.leaderScore - k.aiSuggested);
                return (
                  <TableRow key={k.code}>
                    <TableCell>
                      <div className="font-medium">{k.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{k.code}</div>
                    </TableCell>
                    <TableCell>{k.weight}%</TableCell>
                    <TableCell className="text-muted-foreground">{k.target}</TableCell>
                    <TableCell>
                      <div>{k.achievement}</div>
                      <div className="text-[11px] text-muted-foreground">来源：{k.source}</div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={k.selfScore}
                        onChange={(e) => update(i, "selfScore", Number(e.target.value))}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={k.leaderScore}
                        onChange={(e) => update(i, "leaderScore", Number(e.target.value))}
                        className={cn("h-8", diff >= 10 && "border-orange-400 focus-visible:ring-orange-400")}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          diff >= 10
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200",
                        )}
                      >
                        {diff >= 10 ? "偏差大" : <><CheckCircle2 className="mr-0.5 h-3 w-3" />一致</>} · {k.aiSuggested}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* 评语 */}
        <Card className="p-5">
          <Label className="text-sm">总体评语</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="mt-2"
          />
          <div className="mt-2 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => toast.success("AI 已生成评语建议")}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              AI 生成评语
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
