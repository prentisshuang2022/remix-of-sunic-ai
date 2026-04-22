import { useParams } from "react-router-dom";
import { CheckCircle2, MessagesSquare, Sparkles, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const strengths = [
  "OEE 提升 3.4 个百分点，对全产线节拍优化贡献突出",
  "主动承接新机型量产爬坡，按期完成首件 PPAP",
  "传帮带 2 名新员工，平均上岗周期缩短 20%",
];

const improvements = [
  "工时利用率低于目标 7 个百分点，需复盘换型与待料原因",
  "跨部门协作（与研发结构组）信息同步存在 1~2 天延迟",
];

const talkingPoints = [
  {
    title: "开场（建立信任）",
    text: "本季度你在 OEE 与新机型量产上的贡献我都看到了，先想听你自己怎么复盘这个季度，最满意的是哪一块、最遗憾的是哪一块？",
  },
  {
    title: "肯定与认可",
    text: "你的 OEE 数据从 77.8 提升到 81.2，这背后是你推动的换型 SOP 标准化，这件事我会在月度总结里专门提名表扬。",
  },
  {
    title: "聚焦改进",
    text: "工时利用率这一项，AI 拉到的 MES 数据显示主要损失在『待料』和『换型』两块，下季度我们能否设一个『换型 ≤ 25 分钟』的子目标？我会协调供应链支持你。",
  },
  {
    title: "发展规划",
    text: "公司明年要上第二条激光焊接线，需要工艺组长候选人，我希望你把握这个窗口，下季度开始参与排产协调与跨部门例会。",
  },
  {
    title: "结尾（承诺）",
    text: "我承诺为你协调 ERP 用量数据权限，并安排一次与研发结构组的对齐机制；你这边请把改进计划在本周五前同步给我。",
  },
];

const goalsNext = [
  { kpi: "OEE 设备综合效率", target: "≥ 82%", action: "推动换型 SOP V2 落地" },
  { kpi: "工时利用率", target: "≥ 85%", action: "建立换型计时看板，每周复盘 Top3 损失" },
  { kpi: "跨部门协同", target: "评审参与率 100%", action: "纳入研发结构组双周例会" },
];

export default function PerformanceInterview() {
  const { id = "I001" } = useParams();

  return (
    <div className="flex flex-col">
      <PageHeader
        title="绩效面谈报告"
        description="王磊 · 生产管理部 · 高级工艺工程师 · 2025 Q2 · 总分 87 (B+)"
        backTo="/performance"
        backLabel="返回绩效助手"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success("已重新生成面谈建议")}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              AI 重新生成
            </Button>
            <Button size="sm" onClick={() => toast.success("已标记面谈完成并归档")}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              标记面谈完成
            </Button>
          </>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* 沟通话术 */}
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">AI 沟通话术（按面谈节奏）</h3>
            </div>
            <div className="mt-4 space-y-3">
              {talkingPoints.map((t, i) => (
                <div key={t.title} className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary-soft text-primary border-primary/20 text-[10px]">
                      Step {i + 1}
                    </Badge>
                    <span className="text-sm font-medium">{t.title}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* 下季度目标 */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold">AI 推荐：下季度改进目标</h3>
            <div className="mt-3 space-y-2">
              {goalsNext.map((g) => (
                <div key={g.kpi} className="flex items-start justify-between gap-3 rounded-md border bg-card p-3">
                  <div>
                    <div className="text-sm font-medium">{g.kpi}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">行动：{g.action}</div>
                  </div>
                  <Badge variant="outline" className="shrink-0">{g.target}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* 面谈记录 */}
          <Card className="p-5">
            <Label className="text-sm">面谈记录</Label>
            <Textarea
              rows={5}
              placeholder="记录员工反馈、达成共识、需要 HR/上级跟进事项…"
              className="mt-2"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm">保存草稿</Button>
              <Button size="sm" onClick={() => toast.success("面谈记录已归档至员工档案")}>
                归档至员工档案
              </Button>
            </div>
          </Card>
        </div>

        {/* 右侧：优势 / 改进 / 应用建议 */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold">主要优势</h3>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {strengths.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">待改进点</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {improvements.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">绩效结果应用建议</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">绩效系数</span>
                <Badge variant="outline">1.05</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">入薪建议</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">B+ 档</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">人才动作</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">列入工艺组长候选池</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">培训建议</span>
                <Badge variant="outline">精益生产 Lv2</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
