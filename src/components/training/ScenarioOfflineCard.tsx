import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, MonitorPlay, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: Upload, label: "材料导入", stat: "18 份已入库", done: true },
  { icon: FileText, label: "AI 出卷", stat: "本月 18 套", done: true },
  { icon: MonitorPlay, label: "在线考试", stat: "进行中 2 场", active: true },
  { icon: Archive, label: "批改留档", stat: "待复核 36 份" },
];

export function ScenarioOfflineCard() {
  return (
    <Card className="rounded-2xl overflow-hidden border-0 shadow-sm">
      <div className="h-1.5" style={{ background: "linear-gradient(90deg, hsl(var(--train-offline)), hsl(var(--ai)))" }} />

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full bg-train-offline" />
          <span className="text-[11px] font-mono tracking-wider text-muted-foreground">SCENE 01 · 脱岗培训</span>
        </div>

        <h3 className="text-lg font-semibold">材料进来，成绩出去</h3>
        <p className="text-sm text-muted-foreground mt-1">
          基于培训材料自动生成试卷，客观题自动判分，主观题 AI 初评后交 HR 复核，成绩自动归档
        </p>

        <div className="flex items-center gap-0 mt-6 mb-6 overflow-x-auto">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                  s.active
                    ? "bg-train-offline text-train-offline-foreground shadow-[0_0_12px_hsl(var(--train-offline)/0.4)]"
                    : s.done
                      ? "bg-train-offline/15 text-train-offline border border-train-offline/30"
                      : "bg-muted text-muted-foreground"
                )}>
                  <s.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">{s.label}</span>
                <span className="text-[10px] text-muted-foreground">{s.stat}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "h-px w-8 mx-1 flex-shrink-0",
                  s.done ? "bg-train-offline/40" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" className="bg-train-offline hover:bg-train-offline/90 text-train-offline-foreground">
            + 新建试卷
          </Button>
          <Button size="sm" variant="outline">📂 导入材料</Button>
          <span className="text-xs text-train-offline hover:underline cursor-pointer ml-auto">📊 员工培训档案 →</span>
        </div>

        <div className="flex gap-6 mt-4 pt-3 border-t text-xs text-muted-foreground">
          <span>累计题目 <b className="text-foreground">1,284</b></span>
          <span>自动判分覆盖 <b className="text-foreground">96%</b></span>
        </div>
      </div>
    </Card>
  );
}
