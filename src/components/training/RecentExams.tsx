import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EXAMS = [
  { num: "#1284", title: "激光打标机操作规范", dept: "生产管理部", count: 14, date: "11-13", score: 91.4, level: "high" as const, chip: "已归档", chipKind: "success" as const },
  { num: "#1283", title: "ISO9001 质量意识复训", dept: "品质管理部", count: 22, date: "11-12", score: 78.6, level: "mid" as const, chip: "批改中", chipKind: "purple" as const },
  { num: "#1282", title: "外贸业务员岗前培训", dept: "营销中心", count: 5, date: "11-10", score: 84.2, level: "high" as const, chip: "已归档", chipKind: "success" as const },
  { num: "#1281", title: "太阳能组件装配 SOP", dept: "生产管理部", count: 18, date: "11-08", score: 79.3, level: "mid" as const, chip: "已归档", chipKind: "success" as const },
  { num: "#1280", title: "消防安全与应急处置", dept: "综合管理部", count: 46, date: "11-06", score: 68.1, level: "low" as const, chip: "需补考", chipKind: "danger" as const },
];

const chipStyles: Record<string, string> = {
  success: "bg-success/10 text-success border-success/30",
  purple: "bg-[hsl(239,84%,67%)/0.1] text-[hsl(239,84%,67%)] border-[hsl(239,84%,67%)/0.3]",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
};

export function RecentExams() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-base">最近考试 · 成绩速览</h3>
        <Tabs defaultValue="week">
          <TabsList className="h-7">
            <TabsTrigger value="week" className="text-xs h-5 px-2.5">本周</TabsTrigger>
            <TabsTrigger value="month" className="text-xs h-5 px-2.5">本月</TabsTrigger>
            <TabsTrigger value="quarter" className="text-xs h-5 px-2.5">季度</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div>
        {EXAMS.map((e) => (
          <div key={e.num} className="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center px-5 py-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors duration-150">
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider w-12">{e.num}</span>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{e.title}</div>
              <div className="text-[11px] text-muted-foreground flex gap-2 mt-0.5">
                <span>{e.dept}</span>
                <span className="text-border">·</span>
                <span>参考 {e.count} 人</span>
                <span className="text-border">·</span>
                <span>{e.date}</span>
              </div>
            </div>
            <div className="text-right min-w-[60px]">
              <div className={cn(
                "text-lg font-semibold tabular-nums",
                e.level === "high" && "text-success",
                e.level === "mid" && "text-warning",
                e.level === "low" && "text-destructive"
              )}>{e.score}</div>
              <div className="text-[10px] text-muted-foreground font-mono">AVG</div>
            </div>
            <Badge variant="outline" className={cn("font-mono text-[10px] font-normal", chipStyles[e.chipKind])}>
              {e.chip}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
