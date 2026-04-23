import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useTraining } from "../TrainingContext";
import { employees } from "../training-store";

export default function EmployeeHome() {
  const { tasks, currentEmpId, setEmpTab, setEmpTaskId } = useTraining();
  const emp = employees.find(e => e.id === currentEmpId)!;

  const myTasks = tasks.filter(t => t.status === "进行中" && t.trainees.some(tr => tr.empId === currentEmpId));
  const completedTasks = tasks.filter(t => t.trainees.some(tr => tr.empId === currentEmpId && tr.result === "通过"));
  const pendingCount = myTasks.filter(t => {
    const tr = t.trainees.find(r => r.empId === currentEmpId);
    return tr && tr.result === "未完成";
  }).length;

  return (
    <div className="p-4 space-y-4">
      {/* Welcome */}
      <div>
        <h1 className="text-lg font-bold">{emp.name}，你好！</h1>
        <p className="text-xs text-muted-foreground">{emp.empNo} · {emp.dept}</p>
      </div>

      {/* Warning banner */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-warning-soft text-sm">
          <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
          <span>你有 <strong>{pendingCount}</strong> 项培训将于近期截止</span>
        </div>
      )}

      {/* Pending tasks */}
      <div>
        <h2 className="text-sm font-semibold mb-2">待办任务</h2>
        <div className="space-y-3">
          {myTasks.map(t => {
            const tr = t.trainees.find(r => r.empId === currentEmpId);
            if (!tr || tr.result === "通过") return null;
            return (
              <Card key={t.id} className="rounded-xl">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-base">📘</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tr.learnStatus === "已完成" ? `学习已完成 · ${tr.examScore !== null ? `${tr.examScore} 分` : "还未考试"}` :
                         tr.learnStatus === "学习中" ? `学习进度 ${tr.learnProgress}% · 还未考试` : "未开始 · 截止 " + t.deadline}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-lg text-xs"
                    onClick={() => { setEmpTaskId(t.id); setEmpTab("training"); }}
                  >
                    {tr.learnStatus === "未开始" ? "开始学习" : "继续学习"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {myTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">🎉 暂无待办培训</p>
          )}
        </div>
      </div>

      {/* Completed */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">已完成</h2>
          <div className="space-y-2">
            {completedTasks.map(t => {
              const tr = t.trainees.find(r => r.empId === currentEmpId);
              return (
                <div key={t.id} className="flex items-center gap-2 p-3 rounded-xl bg-success-soft/50">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span className="text-sm flex-1">{t.title}</span>
                  <Badge variant="secondary" className="bg-success-soft text-success rounded-full text-[10px]">{tr?.examScore} 分</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
