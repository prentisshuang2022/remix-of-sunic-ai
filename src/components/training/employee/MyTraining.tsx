import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTraining } from "../TrainingContext";
import { coursewares } from "../training-store";

export default function MyTraining() {
  const { tasks, currentEmpId, empTaskId, setEmpTaskId, setEmpLearning, setEmpExamActive } = useTraining();
  const [tab, setTab] = useState<"pending" | "done">("pending");

  const myTasks = tasks.filter(t => t.trainees.some(tr => tr.empId === currentEmpId));
  const pending = myTasks.filter(t => {
    const tr = t.trainees.find(r => r.empId === currentEmpId);
    return tr && tr.result !== "通过";
  });
  const done = myTasks.filter(t => {
    const tr = t.trainees.find(r => r.empId === currentEmpId);
    return tr && tr.result === "通过";
  });

  // Task detail view
  if (empTaskId) {
    const task = tasks.find(t => t.id === empTaskId);
    const tr = task?.trainees.find(r => r.empId === currentEmpId);
    if (!task || !tr) return null;
    const cws = coursewares.filter(c => task.coursewareIds.includes(c.id));
    const daysLeft = Math.max(0, Math.ceil((new Date(task.deadline).getTime() - Date.now()) / 86400000));

    return (
      <div className="p-4 space-y-4">
        <button onClick={() => setEmpTaskId(null)} className="text-xs text-muted-foreground">← 返回列表</button>
        <div>
          <h1 className="text-base font-bold">{task.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">截止还有 {daysLeft} 天</p>
        </div>

        {/* Step 1: Learn */}
        <Card className="rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="text-2xl">📖</div>
            <div className="flex-1">
              <p className="text-sm font-medium">Step 1 · 学习课件</p>
              <p className="text-xs text-muted-foreground">《{cws[0]?.title ?? "课件"}》</p>
            </div>
            {tr.learnStatus === "已完成" ? (
              <Badge className="bg-success-soft text-success rounded-full text-xs">已完成 ✅</Badge>
            ) : (
              <Button size="sm" className="bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-lg text-xs"
                onClick={() => setEmpLearning(true)}>
                {tr.learnStatus === "学习中" ? "继续学习" : "去学习 ▶"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Exam */}
        <Card className="rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="text-2xl">📝</div>
            <div className="flex-1">
              <p className="text-sm font-medium">Step 2 · 参加考试</p>
              <p className="text-xs text-muted-foreground">{task.examQuestionCount} 题 · {task.examDuration} 分钟 · {task.passingScore} 分及格</p>
            </div>
            {tr.examScore !== null ? (
              <Badge className={cn("rounded-full text-xs", tr.examScore >= task.passingScore ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>{tr.examScore} 分</Badge>
            ) : tr.learnStatus !== "已完成" ? (
              <Badge variant="secondary" className="rounded-full text-xs text-muted-foreground">需先完成学习</Badge>
            ) : (
              <Button size="sm" className="bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-lg text-xs"
                onClick={() => setEmpExamActive(true)}>
                开始考试 ▶
              </Button>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full rounded-lg" onClick={() => setEmpTaskId(null)}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold">我的培训</h1>
      <div className="flex gap-2">
        {(["pending", "done"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors",
              tab === t ? "bg-sg-blue text-sg-blue-foreground" : "bg-muted text-muted-foreground")}>
            {t === "pending" ? `待完成 ${pending.length}` : `已完成 ${done.length}`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {(tab === "pending" ? pending : done).map(t => {
          const tr = t.trainees.find(r => r.empId === currentEmpId);
          return (
            <Card key={t.id} className="rounded-xl cursor-pointer" onClick={() => setEmpTaskId(t.id)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <span className="text-base">📘</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tr?.result === "通过" ? `${tr.examScore} 分 · 已通过` : `学习 ${tr?.learnProgress ?? 0}% · 截止 ${t.deadline}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">›</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
