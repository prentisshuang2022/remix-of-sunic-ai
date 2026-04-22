import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NODES = [
  { week: "W1", label: "入厂认知", date: "04-01", status: "done" as const, action: "线下实操 · 评分 A" },
  { week: "W2", label: "导师指派", date: "04-08", status: "done" as const, action: "导师：张磊" },
  { week: "W4", label: "中期评估", date: "04-22", status: "active" as const, action: "待导师提交" },
  { week: "W8", label: "出师考核", date: "05-27", status: "pending" as const },
];

const statusMap = {
  done: { dot: "bg-success", text: "text-success", label: "已完成" },
  active: { dot: "bg-train-offline animate-pulse", text: "text-train-offline", label: "进行中" },
  pending: { dot: "bg-muted-foreground/30", text: "text-muted-foreground", label: "未启动" },
};

export function MenteeTimeline() {
  return (
    <Card className="rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-base">当前学徒节点</h3>
        <span className="text-xs text-muted-foreground">在带学徒 · 32 人</span>
      </div>

      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-train-onsite/15 text-train-onsite flex items-center justify-center text-sm font-bold">陈</div>
        <div>
          <p className="text-sm font-medium">陈伟杰</p>
          <p className="text-[11px] text-muted-foreground">供应链/仓储组 · 鄂州基地 · 导师：张磊</p>
        </div>
      </div>

      <div className="px-5 py-3">
        {NODES.map((n, i) => {
          const s = statusMap[n.status];
          return (
            <div key={n.week} className="flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <div className={cn("h-3 w-3 rounded-full flex-shrink-0 mt-0.5", s.dot)} />
                {i < NODES.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{n.week}</span>
                  <span className="text-sm font-medium">{n.label}</span>
                  <Badge variant="outline" className={cn("text-[10px] font-normal ml-auto", s.text)}>{s.label}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{n.date}</p>
                {n.action && (
                  <p className={cn("text-xs mt-1", n.status === "active" ? "text-train-offline font-medium" : "text-muted-foreground")}>
                    {n.action}
                    {n.status === "active" && (
                      <Button size="sm" variant="outline" className="ml-2 h-5 text-[10px] px-2 border-train-offline/40 text-train-offline">
                        催交导师
                      </Button>
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t">
        <span className="text-xs text-train-onsite hover:underline cursor-pointer">查看全部学徒 →</span>
      </div>
    </Card>
  );
}
