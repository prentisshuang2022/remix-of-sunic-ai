import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  Trophy,
} from "lucide-react";

const KPIS = [
  {
    label: "本月考试场次",
    value: "24",
    unit: "场",
    trend: "↑ 18% 环比",
    trendKind: "up" as const,
    icon: ClipboardCheck,
    foot: "脱岗 18 场 · 在岗抽测 6 场",
    accent: "primary" as const,
  },
  {
    label: "待 HR 复核",
    value: "36",
    unit: "份",
    trend: "7 份已逾期",
    trendKind: "down" as const,
    icon: Clock,
    foot: "主观题 AI 初评完成 · 待人工确认",
    accent: "warning" as const,
  },
  {
    label: "在岗培训达成率",
    value: "87",
    unit: "%",
    trend: "↑ 4.2% 较上月",
    trendKind: "up" as const,
    icon: CheckCircle2,
    foot: "黄龙山基地领先 · 4 厂区打卡",
    accent: "success" as const,
  },
  {
    label: "平均成绩",
    value: "82.4",
    unit: "分",
    trend: "激光工艺岗 88.1 最高",
    trendKind: "flat" as const,
    icon: Trophy,
    foot: "较上月持平",
    accent: "ai" as const,
  },
];

const accentMap: Record<string, string> = {
  primary: "text-primary bg-primary/10",
  warning: "text-warning bg-warning/15",
  success: "text-success bg-success/15",
  ai: "text-[hsl(var(--ai))] bg-[hsl(var(--ai-soft))]",
};

const stripeMap: Record<string, string> = {
  primary: "from-primary to-transparent",
  warning: "from-warning to-transparent",
  success: "from-success to-transparent",
  ai: "from-[hsl(var(--ai))] to-transparent",
};

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {KPIS.map((k) => {
        const Icon = k.icon;
        return (
          <Card
            key={k.label}
            className="p-5 rounded-2xl relative overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
          >
            <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", stripeMap[k.accent])} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", accentMap[k.accent])}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums tracking-tight">{k.value}</span>
              <span className="text-xs text-muted-foreground">{k.unit}</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "mt-2 font-mono text-[10px] font-normal",
                k.trendKind === "up" && "bg-success/10 text-success border-success/30",
                k.trendKind === "down" && "bg-destructive/10 text-destructive border-destructive/30",
                k.trendKind === "flat" && "bg-muted text-muted-foreground border-border"
              )}
            >
              {k.trend}
            </Badge>
            <div className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-dashed">{k.foot}</div>
          </Card>
        );
      })}
    </div>
  );
}
