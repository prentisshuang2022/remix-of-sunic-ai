import { Card } from "@/components/ui/card";
import { ClipboardCheck, Clock, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const KPIS = [
  {
    title: "本月考试",
    value: "24 场",
    sub: "平均分 82.4 · 激光工艺岗 88.1 最高",
    badge: "↑18% 环比",
    badgeClass: "bg-success-soft text-success border-success/30",
    icon: ClipboardCheck,
    iconClass: "bg-train-offline-soft text-train-offline",
  },
  {
    title: "待 HR 复核",
    value: "36 份",
    sub: "主观题 AI 初评完成 · 待人工确认",
    badge: "7 份已逾期",
    badgeClass: "bg-danger-soft text-destructive border-destructive/30",
    icon: Clock,
    iconClass: "bg-warning-soft text-warning",
    clickable: true,
  },
  {
    title: "在岗培训达成率",
    value: "87%",
    sub: "4 厂区打卡 · 黄龙山基地领先",
    badge: "↑4.2% 较上月",
    badgeClass: "bg-success-soft text-success border-success/30",
    icon: Target,
    iconClass: "bg-train-onsite-soft text-train-onsite",
  },
];

export function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {KPIS.map((k) => (
        <Card
          key={k.title}
          className={`rounded-2xl p-5 flex items-start gap-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${k.clickable ? "cursor-pointer" : ""}`}
        >
          <div className={`rounded-xl p-2.5 ${k.iconClass}`}>
            <k.icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{k.title}</p>
            <p className="text-2xl font-bold tracking-tight mt-0.5">{k.value}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{k.sub}</p>
            <Badge variant="outline" className={`mt-2 text-[10px] font-normal ${k.badgeClass}`}>{k.badge}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
