import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTraining } from "../TrainingContext";
import { employees, coursewares } from "../training-store";
import { toast } from "@/hooks/use-toast";

export default function TaskDetail() {
  const { selectedTaskId, tasks, setHRPage } = useTraining();
  const task = tasks.find(t => t.id === selectedTaskId);
  const [tab, setTab] = useState<"list" | "learn" | "exam">("list");

  if (!task) return null;

  const cws = coursewares.filter(c => task.coursewareIds.includes(c.id));

  const resultColor = (r: string) => {
    if (r === "通过") return "bg-success-soft text-success";
    if (r === "未通过") return "bg-danger-soft text-danger";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <button onClick={() => setHRPage("tasks")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />返回任务列表
      </button>

      {/* Header */}
      <Card className="rounded-xl">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold">{task.title}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                由 {task.createdBy} 创建于 {task.createdAt} · 关联课件：{cws.map(c => c.title).join("、")} · {task.passingScore} 分及格 · 限时 {task.examDuration} 分钟
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg">
                <Download className="h-3.5 w-3.5 mr-1" />导出 Excel
              </Button>
              <Button size="sm" className="bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-lg" onClick={() => toast({ title: "催办已发送", description: "已通知所有未完成的员工" })}>
                <Bell className="h-3.5 w-3.5 mr-1" />一键催办
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["list", "learn", "exam"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] transition-colors",
              tab === t ? "border-sg-blue text-sg-blue" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "list" ? "参训名单" : t === "learn" ? "学习数据" : "考试数据"}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="rounded-xl">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium">姓名</th>
                <th className="text-left p-3 font-medium">工号</th>
                <th className="text-left p-3 font-medium">部门</th>
                <th className="text-left p-3 font-medium">学习状态</th>
                <th className="text-left p-3 font-medium">考试成绩</th>
                <th className="text-left p-3 font-medium">最终结果</th>
              </tr>
            </thead>
            <tbody>
              {task.trainees.map(tr => {
                const emp = employees.find(e => e.id === tr.empId);
                if (!emp) return null;
                return (
                  <tr key={tr.empId} className={cn("border-b hover:bg-accent/30", tr.examScore !== null && tr.examScore < 60 && "bg-danger-soft/30")}>
                    <td className="p-3">{emp.name}</td>
                    <td className="p-3 text-muted-foreground">{emp.empNo}</td>
                    <td className="p-3 text-muted-foreground">{emp.dept}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className={cn("rounded-full text-[10px]",
                        tr.learnStatus === "已完成" ? "bg-success-soft text-success" :
                        tr.learnStatus === "学习中" ? "bg-sg-blue-soft text-sg-blue" : "bg-muted text-muted-foreground"
                      )}>{tr.learnStatus}</Badge>
                    </td>
                    <td className="p-3">{tr.examScore !== null ? `${tr.examScore} 分` : "—"}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className={cn("rounded-full text-[10px]", resultColor(tr.result))}>{tr.result}</Badge>
                    </td>
                  </tr>
                );
              })}
              {task.trainees.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">暂无参训记录</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
