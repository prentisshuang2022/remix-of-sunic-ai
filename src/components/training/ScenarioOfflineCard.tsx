import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileUp, BrainCircuit, MonitorPlay, ClipboardCheck } from "lucide-react";

const FLOW = [
  { n: "①", t: "材料导入", icon: FileUp, state: "done" as const, sub: "已完成 · 18 份", path: "/training/question-bank" },
  { n: "②", t: "AI 出卷", icon: BrainCircuit, state: "done" as const, sub: "今日 3 套", path: "/training/offsite" },
  { n: "③", t: "在线考试", icon: MonitorPlay, state: "cur" as const, sub: "进行中 · 2 场", path: "/training/offsite" },
  { n: "④", t: "批改留档", icon: ClipboardCheck, state: "pending" as const, sub: "待 HR 复核 36 份", path: "/training/materials" },
];

const STATS = [
  { n: "18", l: "本月试卷" },
  { n: "1,284", l: "累计题目" },
  { n: "96%", l: "自动判分覆盖" },
];

export function ScenarioOfflineCard() {
  const navigate = useNavigate();

  return (
    <Card className="p-6 rounded-2xl overflow-hidden relative bg-gradient-to-br from-[hsl(239,84%,67%)/0.06] to-transparent border-[hsl(239,84%,67%)/0.2] hover:shadow-lg transition-shadow duration-150">
      {/* Tag */}
      <div className="font-mono text-[10px] tracking-wider text-[hsl(239,84%,67%)] flex items-center gap-1.5 mb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[hsl(239,84%,67%)]" />
        SCENE 01 · 脱岗培训
      </div>

      <h3 className="text-xl font-semibold tracking-tight mb-1">材料进来，成绩出去</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        基于培训材料自动生成题库与试卷，客观题自动判分，主观题 AI 初评后交 HR 复核，成绩与凭证一并写入员工培训档案。
      </p>

      {/* Flow */}
      <div className="flex items-start justify-between bg-background/60 rounded-xl p-4 mb-5 border border-border/50">
        {FLOW.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => navigate(f.path)}
                className="flex flex-col items-center gap-1.5 flex-1 group cursor-pointer"
              >
                <div
                  className={cn(
                    "h-11 w-11 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-110",
                    f.state === "done" && "bg-[hsl(239,84%,67%)] text-white border-[hsl(239,84%,67%)]",
                    f.state === "cur" && "bg-background text-[hsl(239,84%,67%)] border-[hsl(239,84%,67%)] ring-4 ring-[hsl(239,84%,67%)/0.15] shadow-[0_0_12px_hsl(239,84%,67%,0.25)]",
                    f.state === "pending" && "bg-background text-muted-foreground border-border"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className={cn("text-xs font-medium", f.state === "pending" ? "text-muted-foreground" : "text-foreground")}>{f.t}</span>
                <span className={cn("text-[10px]", f.state === "pending" ? "text-muted-foreground" : "text-muted-foreground")}>{f.sub}</span>
              </button>
              {i < FLOW.length - 1 && (
                <div className="flex items-center -mb-8 shrink-0 mx-1">
                  <div className={cn("h-px w-6", f.state === "done" ? "bg-[hsl(239,84%,67%)]" : "bg-border")} />
                  <div className={cn("h-0 w-0 border-t-[3px] border-b-[3px] border-l-[5px] border-t-transparent border-b-transparent", f.state === "done" ? "border-l-[hsl(239,84%,67%)]" : "border-l-border")} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {STATS.map((s) => (
          <div key={s.l} className="bg-background/60 rounded-lg px-3 py-2.5 border border-border/50 text-center">
            <div className="text-lg font-semibold tabular-nums">{s.n}</div>
            <div className="text-[10px] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="bg-[hsl(239,84%,67%)] hover:bg-[hsl(239,84%,67%)]/90 text-white" onClick={() => navigate("/training/offsite")}>
          进入脱岗培训 <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate("/training/question-bank")}>查看题库</Button>
      </div>
    </Card>
  );
}
