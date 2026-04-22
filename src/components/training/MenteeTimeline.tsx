import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

const TIMELINE = [
  { state: "done" as const, label: "W1 入厂认知", date: "10-28", desc: "导师 李建华 · 仓储主管 · 入厂安全培训完成", tags: ["已完成", "评分 A"] },
  { state: "done" as const, label: "W2 仓储 SOP", date: "11-04", desc: "覆盖 ERP 出入库、库位规则、激光器及光学组件存储要求", tags: ["已完成", "线下实操"] },
  { state: "active" as const, label: "W4 中期评估", date: "11-18", desc: "导师需在钉钉提交：实操表现、问题清单、下阶段目标", tags: ["还差 2 天", "待导师提交"] },
  { state: "pending" as const, label: "W6 跨厂轮岗", date: "12-02", desc: "激光器整机装配线见习（黄龙山基地）· 2 天", tags: ["未启动"] },
  { state: "pending" as const, label: "W8 出师考核", date: "12-16", desc: "笔试 40 题 + 实操演示 + 导师鉴定", tags: ["未启动"] },
];

const tagStyle: Record<string, string> = {
  done: "bg-success/10 text-success border-success/30",
  active: "bg-[hsl(239,84%,67%)/0.1] text-[hsl(239,84%,67%)] border-[hsl(239,84%,67%)/0.3]",
  pending: "bg-muted text-muted-foreground border-border",
};

export function MenteeTimeline() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">在岗培训节点 · 王小明</h3>
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">供应链 / 仓储组 · 鄂州基地</div>
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          查看完整 <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </Button>
      </div>
      <div className="px-5 py-4">
        {TIMELINE.map((t, i) => (
          <div
            key={i}
            className="relative grid grid-cols-[18px_1fr] gap-3 pb-4 last:pb-0 cursor-pointer group"
            onClick={() => toast.info(`查看节点：${t.label}`)}
          >
            {/* Connector line */}
            {i < TIMELINE.length - 1 && (
              <div className={cn("absolute left-[5px] top-4 bottom-0 w-px", t.state === "done" ? "bg-[hsl(160,59%,46%)]" : "bg-border")} />
            )}
            {/* Dot */}
            <div className={cn(
              "h-3 w-3 rounded-full mt-1 z-10 border-2 transition-transform group-hover:scale-125",
              t.state === "done" && "bg-[hsl(160,59%,46%)] border-[hsl(160,59%,46%)]",
              t.state === "active" && "bg-background border-[hsl(239,84%,67%)] ring-4 ring-[hsl(239,84%,67%)/0.15] animate-pulse",
              t.state === "pending" && "bg-background border-dashed border-border"
            )} />
            {/* Content */}
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className={cn("text-sm", t.state !== "pending" ? "font-medium" : "text-muted-foreground")}>{t.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{t.date}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{t.desc}</div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {t.tags.map((tag, j) => (
                  <Badge key={j} variant="outline" className={cn("font-mono text-[9px] font-normal py-0 px-1.5 h-4", tagStyle[t.state])}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
