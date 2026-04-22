import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FACTORIES = ["全部", "黄龙山", "鄂州", "光谷", "汉南"];
const FACTORY_COUNTS: Record<string, { apprentices: number; mentors: number; rate: string }> = {
  "全部": { apprentices: 32, mentors: 14, rate: "87%" },
  "黄龙山": { apprentices: 12, mentors: 5, rate: "91%" },
  "鄂州": { apprentices: 9, mentors: 4, rate: "84%" },
  "光谷": { apprentices: 7, mentors: 3, rate: "88%" },
  "汉南": { apprentices: 4, mentors: 2, rate: "82%" },
};

const MILESTONES = [
  { week: "W1", label: "入厂认知", done: true },
  { week: "W2", label: "导师指派", done: true },
  { week: "W4", label: "中期评估", active: true },
  { week: "W8", label: "出师考核" },
];

export function ScenarioOnTheJobCard() {
  const [factory, setFactory] = useState("全部");
  const stats = FACTORY_COUNTS[factory];

  return (
    <Card className="rounded-2xl overflow-hidden border-0 shadow-sm">
      <div className="h-1.5" style={{ background: "linear-gradient(90deg, hsl(var(--train-onsite)), hsl(var(--success)))" }} />

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full bg-train-onsite" />
          <span className="text-[11px] font-mono tracking-wider text-muted-foreground">SCENE 02 · 在岗培训</span>
        </div>

        <h3 className="text-lg font-semibold">按节点推进，跨厂区协同</h3>
        <p className="text-sm text-muted-foreground mt-1">
          按周/月节点自动提醒导师与员工提交培训记录，跨厂区统一归档
        </p>

        <div className="flex gap-1 mt-4 flex-wrap">
          {FACTORIES.map((f) => (
            <button
              key={f}
              onClick={() => setFactory(f)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                factory === f
                  ? "bg-train-onsite text-train-onsite-foreground"
                  : "bg-muted text-muted-foreground hover:bg-train-onsite/10"
              )}
            >
              {f}{f === "全部" && ` ${Object.keys(FACTORY_COUNTS).length - 1}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0 mt-6 mb-6 overflow-x-auto">
          {MILESTONES.map((m, i) => (
            <div key={m.week} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  m.active
                    ? "bg-train-onsite text-train-onsite-foreground shadow-[0_0_12px_hsl(var(--train-onsite)/0.4)] animate-pulse"
                    : m.done
                      ? "bg-train-onsite/15 text-train-onsite border border-train-onsite/30"
                      : "bg-muted text-muted-foreground"
                )}>
                  {m.week}
                </div>
                <span className="text-xs font-medium">{m.label}</span>
              </div>
              {i < MILESTONES.length - 1 && (
                <div className={cn(
                  "h-px w-8 mx-1 flex-shrink-0",
                  m.done ? "bg-train-onsite/40" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" className="bg-train-onsite hover:bg-train-onsite/90 text-train-onsite-foreground">
            📥 一键汇总本周记录
          </Button>
          <Button size="sm" variant="outline">📣 催交未提交</Button>
          <span className="text-xs text-train-onsite hover:underline cursor-pointer ml-auto">📋 导出 Excel →</span>
        </div>

        <div className="flex gap-6 mt-4 pt-3 border-t text-xs text-muted-foreground">
          <span>在带学徒 <b className="text-foreground">{stats.apprentices} 人</b></span>
          <span>导师 <b className="text-foreground">{stats.mentors} 位</b></span>
          <span>节点达成 <b className="text-foreground">{stats.rate}</b></span>
        </div>
      </div>
    </Card>
  );
}
