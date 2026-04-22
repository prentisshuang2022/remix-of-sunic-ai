import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, Megaphone, Monitor } from "lucide-react";

export function TodayActionBar() {
  return (
    <Card className="overflow-hidden rounded-2xl border-0 shadow-sm"
      style={{ background: "linear-gradient(135deg, hsl(var(--train-offline-soft)), hsl(var(--info-soft)))" }}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-5 relative">
        {/* left purple bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-train-offline" />

        {/* text */}
        <div className="flex-1 pl-3">
          <span className="text-[11px] font-mono tracking-wider text-muted-foreground">TODAY · 2026-04-22</span>
          <p className="text-[15px] font-medium mt-1 leading-relaxed">
            今天有&nbsp;
            <span className="text-lg font-bold text-train-offline">3&nbsp;份</span>试卷待批改 ·&nbsp;
            <span className="text-lg font-bold text-train-offline">5&nbsp;位</span>导师未提交 W2 记录 ·&nbsp;
            <span className="text-lg font-bold text-train-offline">2&nbsp;场</span>考试即将开考
          </p>
          <p className="text-xs text-muted-foreground mt-1">其中 2 份已逾期 48 小时，建议优先处理</p>
        </div>

        {/* action buttons */}
        <div className="flex flex-wrap gap-2 pl-3 lg:pl-0">
          <Button size="sm" className="bg-train-offline hover:bg-train-offline/90 text-train-offline-foreground">
            <FileCheck className="h-4 w-4 mr-1.5" />去批改
          </Button>
          <Button size="sm" variant="outline" className="border-train-offline/40 text-train-offline hover:bg-train-offline/10">
            <Megaphone className="h-4 w-4 mr-1.5" />一键催交
          </Button>
          <Button size="sm" variant="outline">
            <Monitor className="h-4 w-4 mr-1.5" />查看考试
          </Button>
        </div>
      </div>
    </Card>
  );
}
