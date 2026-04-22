import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TASKS = [
  { type: "改", typeColor: "purple" as const, title: "《激光划片机安全操作》试卷待批改（主观题）", meta: "生产管理部 · 激光工艺组 · 8 人", deadline: "11-14 截止", state: "urgent" as const, stateLabel: "紧急 · 今日" },
  { type: "试", typeColor: "blue" as const, title: "ISO9001 质量体系复训 · 试卷生成待确认", meta: "品质管理部 全员 · 40 题 · 建议难度 中", deadline: "已等待 1 天", state: "waiting" as const, stateLabel: "待审核" },
  { type: "带", typeColor: "green" as const, title: "新员工在岗培训 · W2 导师记录未提交", meta: "供应链 · 仓储组 · 导师 李建华 · 鄂州基地", deadline: "还差 2 天", state: "progress" as const, stateLabel: "进行中" },
  { type: "档", typeColor: "orange" as const, title: "外贸业务员岗前培训考试 · 自动判分完成", meta: "营销中心 · 外贸组 · 5 人 / 平均 84.2", deadline: "今日 10:24", state: "done" as const, stateLabel: "待归档" },
  { type: "训", typeColor: "teal" as const, title: "太阳能组件装配 SOP · 节点抽检", meta: "生产管理部 · 组件车间 · 黄龙山基地 · 跨厂区协同", deadline: "计划 11-18", state: "progress" as const, stateLabel: "本周内" },
];

const typeStyles: Record<string, string> = {
  purple: "bg-[hsl(239,84%,67%)/0.1] text-[hsl(239,84%,67%)]",
  blue: "bg-info/10 text-info",
  green: "bg-success/15 text-success",
  orange: "bg-warning/15 text-warning",
  teal: "bg-primary/10 text-primary",
};

const stateStyles: Record<string, string> = {
  urgent: "bg-destructive/10 text-destructive border-destructive/30",
  waiting: "bg-warning/15 text-warning border-warning/30",
  progress: "bg-[hsl(239,84%,67%)/0.1] text-[hsl(239,84%,67%)] border-[hsl(239,84%,67%)/0.3]",
  done: "bg-success/10 text-success border-success/30",
};

export function TodoList() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? TASKS : TASKS.filter((t) => t.state === filter);

  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-base">待办任务</h3>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="h-7">
            <TabsTrigger value="all" className="text-xs h-5 px-2.5">全部 {TASKS.length}</TabsTrigger>
            <TabsTrigger value="urgent" className="text-xs h-5 px-2.5">紧急 1</TabsTrigger>
            <TabsTrigger value="waiting" className="text-xs h-5 px-2.5">已逾期 1</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div>
        {filtered.map((t, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b last:border-b-0 hover:bg-muted/40 transition-colors duration-150">
            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0", typeStyles[t.typeColor])}>
              {t.type}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{t.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{t.meta}</div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant="outline" className={cn("font-mono text-[10px] font-normal", stateStyles[t.state])}>
                {t.stateLabel}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono">{t.deadline}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
