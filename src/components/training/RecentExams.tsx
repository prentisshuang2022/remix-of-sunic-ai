import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXAMS = [
  { num: "#1284", title: "激光打标机操作规范", dept: "生产部·黄龙山", count: 12, date: "04-20", score: 85.3, level: "high" as const, chip: "已归档", chipKind: "success" as const },
  { num: "#1283", title: "ISO9001 质量意识复训", dept: "质量部·鄂州", count: 24, date: "04-19", score: 78.6, level: "mid" as const, chip: "批改中", chipKind: "purple" as const },
  { num: "#1282", title: "外贸业务员岗前培训", dept: "销售部·光谷", count: 8, date: "04-18", score: 81.2, level: "high" as const, chip: "已归档", chipKind: "success" as const },
  { num: "#1281", title: "太阳能组件装配 SOP", dept: "生产部·汉南", count: 16, date: "04-17", score: 76.4, level: "low" as const, chip: "需补考", chipKind: "danger" as const },
  { num: "#1280", title: "消防安全与应急处置", dept: "全员·黄龙山", count: 52, date: "04-15", score: 88.1, level: "high" as const, chip: "已归档", chipKind: "success" as const },
];

const chipStyles: Record<string, string> = {
  success: "bg-success-soft text-success border-success/30",
  purple: "bg-train-offline-soft text-train-offline border-train-offline/30",
  danger: "bg-danger-soft text-destructive border-destructive/30",
};

export function RecentExams() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-base">最近考试</h3>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="week">
            <TabsList className="h-7">
              <TabsTrigger value="week" className="text-xs h-5 px-2.5">本周</TabsTrigger>
              <TabsTrigger value="month" className="text-xs h-5 px-2.5">本月</TabsTrigger>
              <TabsTrigger value="quarter" className="text-xs h-5 px-2.5">季度</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div>
        {EXAMS.map((e) => (
          <div key={e.num} className="group grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center px-5 py-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors duration-150">
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider w-12">{e.num}</span>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{e.title}</div>
              <div className="text-[11px] text-muted-foreground flex gap-2 mt-0.5">
                <span>{e.dept}</span>
                <span className="text-border">·</span>
                <span>{e.count} 人</span>
                <span className="text-border">·</span>
                <span>{e.date}</span>
              </div>
            </div>
            <div className="text-right min-w-[52px]">
              <div className={cn(
                "text-lg font-semibold tabular-nums",
                e.level === "high" && "text-success",
                e.level === "mid" && "text-warning",
                e.level === "low" && "text-destructive"
              )}>{e.score}</div>
              <div className="text-[10px] text-muted-foreground font-mono">AVG</div>
            </div>
            <div className="min-w-[56px] text-right">
              <Badge variant="outline" className={cn("font-mono text-[10px] font-normal", chipStyles[e.chipKind])}>
                {e.chip}
              </Badge>
              <span className="text-[11px] text-train-offline opacity-0 group-hover:opacity-100 transition-opacity block mt-0.5 cursor-pointer">查看 →</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
