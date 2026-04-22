import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

const MILESTONES = [
  { n: "W1", t: "入厂认知", state: "done" as const },
  { n: "W2", t: "导师指派", state: "done" as const },
  { n: "W4", t: "中期评估", state: "cur" as const },
  { n: "W8", t: "出师考核", state: "pending" as const },
];

const STATS = [
  { n: "2", l: "协同厂区" },
  { n: "32", l: "在带学徒" },
  { n: "87%", l: "节点达成率" },
];

export function ScenarioOnTheJobCard() {
  const navigate = useNavigate();

  return (
    <Card className="p-6 rounded-2xl overflow-hidden relative bg-gradient-to-br from-[hsl(160,59%,46%)/0.06] to-transparent border-[hsl(160,59%,46%)/0.2] hover:shadow-lg transition-shadow duration-150">
      <div className="font-mono text-[10px] tracking-wider text-[hsl(160,59%,46%)] flex items-center gap-1.5 mb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[hsl(160,59%,46%)]" />
        SCENE 02 · 在岗培训
      </div>

      <h3 className="text-xl font-semibold tracking-tight mb-1">按节点推进，跨厂区协同</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        按周/月节点自动提醒导师与员工提交培训记录，跨黄龙山、鄂州等厂区统一归档，支持激光工艺、太阳能装配等岗位的带教追踪。
      </p>

      {/* Milestones */}
      <div className="flex items-start justify-between bg-background/60 rounded-xl p-4 mb-5 border border-border/50">
        {MILESTONES.map((m, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => toast.info(`查看节点：${m.t}`)}
              className="flex flex-col items-center gap-1.5 flex-1 group cursor-pointer"
            >
              <div
                className={cn(
                  "h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-transform group-hover:scale-110",
                  m.state === "done" && "bg-[hsl(160,59%,46%)] text-white border-[hsl(160,59%,46%)]",
                  m.state === "cur" && "bg-background text-[hsl(160,59%,46%)] border-[hsl(160,59%,46%)] ring-4 ring-[hsl(160,59%,46%)/0.15] shadow-[0_0_12px_hsl(160,59%,46%,0.25)] animate-pulse",
                  m.state === "pending" && "bg-background text-muted-foreground border-border"
                )}
              >
                {m.n}
              </div>
              <span className={cn("text-xs font-medium", m.state === "pending" ? "text-muted-foreground" : "text-foreground")}>{m.t}</span>
            </button>
            {i < MILESTONES.length - 1 && (
              <div className="flex items-center -mb-5 shrink-0 mx-1">
                <div className={cn("h-px w-6", m.state === "done" ? "bg-[hsl(160,59%,46%)]" : "bg-border")} />
                <div className={cn("h-0 w-0 border-t-[3px] border-b-[3px] border-l-[5px] border-t-transparent border-b-transparent", m.state === "done" ? "border-l-[hsl(160,59%,46%)]" : "border-l-border")} />
              </div>
            )}
          </div>
        ))}
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
        <Button size="sm" className="bg-[hsl(160,59%,46%)] hover:bg-[hsl(160,59%,46%)]/90 text-white" onClick={() => navigate("/training/onsite")}>
          进入在岗培训 <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate("/training/mentors")}>查看导师</Button>
      </div>
    </Card>
  );
}
