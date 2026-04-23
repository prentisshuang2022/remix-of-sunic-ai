import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Bell, StopCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTraining } from "../TrainingContext";
import { typeConfig, statusConfig, type TaskStatus } from "../training-store";
import NewTaskDrawer from "./NewTaskDrawer";

const filters: { label: string; value: TaskStatus | "all" }[] = [
  { label: "全部", value: "all" },
  { label: "进行中", value: "inProgress" },
  { label: "已结束", value: "completed" },
  { label: "草稿", value: "draft" },
];

export default function TrainingTasks() {
  const { tasks, selectTask } = useTraining();
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">培训任务</h2>
        <Button className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 text-white rounded-xl" onClick={() => setDrawerOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />新建培训任务
        </Button>
      </div>

      <div className="flex gap-2">
        {filters.map(f => {
          const sc = f.value !== "all" ? statusConfig[f.value] : null;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                filter === f.value ? "bg-[#1E6FFF] text-white" : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              {f.label}
              {f.value === "all" && <span className="ml-1">{tasks.length}</span>}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map(t => {
          const tc = typeConfig[t.type];
          const sc = statusConfig[t.status];
          const learned = t.trainees.filter(r => r.learnStatus === "已完成").length;
          const examined = t.trainees.filter(r => r.examScore !== null).length;
          const pushed = t.trainees.filter(r => r.notifyStatus !== "未推送").length;
          const passed = t.trainees.filter(r => r.result === "通过").length;
          const failed = t.trainees.filter(r => r.result === "未通过").length;

          return (
            <Card key={t.id} className="rounded-2xl shadow-sm hover:shadow transition-shadow cursor-pointer" onClick={() => selectTask(t.id)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${tc.bg} ${tc.text} border ${tc.border} text-xs`}>{tc.label}</Badge>
                      <span className="font-medium">{t.title}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{t.target} · {t.headcount} 人</span>
                      <span>已推送 {pushed}/{t.headcount} · 已完成 {learned} · 通过 {passed} · 未通过 {failed}</span>
                      <span>截止 {t.deadline}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`${sc.bg} ${sc.text} text-[10px] rounded-full`}>{sc.label}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); selectTask(t.id); }}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {t.status === "inProgress" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}>
                            <Bell className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}>
                            <StopCircle className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <NewTaskDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
