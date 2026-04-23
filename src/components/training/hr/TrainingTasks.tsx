import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Bell, StopCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTraining } from "../TrainingContext";
import type { TaskStatus } from "../training-store";
import NewTaskDialog from "./NewTaskDialog";

const typeColors: Record<string, string> = {
  "新员工入职": "bg-sg-blue-soft text-sg-blue",
  "岗位技能": "bg-train-onsite-soft text-train-onsite",
  "安全复训": "bg-warning-soft text-warning",
  "新工艺导入": "bg-train-offline-soft text-train-offline",
};

const statusColors: Record<string, string> = {
  "进行中": "bg-sg-blue-soft text-sg-blue",
  "已结束": "bg-success-soft text-success",
  "草稿": "bg-muted text-muted-foreground",
};

const filters: { label: string; value: TaskStatus | "all" }[] = [
  { label: "全部", value: "all" },
  { label: "进行中", value: "进行中" },
  { label: "已结束", value: "已结束" },
  { label: "草稿", value: "草稿" },
];

export default function TrainingTasks() {
  const { tasks, selectTask } = useTraining();
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">培训任务</h1>
        <Button className="bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-xl" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />新建培训任务
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              filter === f.value ? "bg-sg-blue text-sg-blue-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {f.label}
            {f.value === "all" && <span className="ml-1">{tasks.length}</span>}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.map(t => {
          const learned = t.trainees.filter(r => r.learnStatus === "已完成").length;
          const examined = t.trainees.filter(r => r.examScore !== null).length;
          return (
            <Card key={t.id} className="rounded-xl hover:shadow transition-shadow cursor-pointer" onClick={() => selectTask(t.id)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-sg-blue" />
                      <span className="font-medium">{t.title}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="secondary" className={cn("rounded-full text-[10px]", typeColors[t.type])}>{t.type}</Badge>
                      <span className="text-muted-foreground">{t.target} · {t.headcount} 人</span>
                      <span className="text-muted-foreground">学习 {learned}/{t.headcount} · 考试 {examined}/{t.headcount}</span>
                      <span className="text-muted-foreground">截止 {t.deadline}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={cn("rounded-full text-[10px]", statusColors[t.status])}>{t.status}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); selectTask(t.id); }}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {t.status === "进行中" && (
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

      <NewTaskDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
