import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTraining } from "../TrainingContext";
import { employees, coursewares } from "../training-store";
import { toast } from "sonner";

export default function TaskDetail() {
  const { selectedTaskId, tasks, backToTaskList, updateTrainee } = useTraining();
  const task = tasks.find(t => t.id === selectedTaskId);
  const [tab, setTab] = useState<"list" | "learn" | "exam">("list");

  if (!task) return null;

  const cws = coursewares.filter(c => task.coursewareIds.includes(c.id));

  const resultColor = (r: string) => {
    if (r === "通过") return "bg-emerald-50 text-emerald-700";
    if (r === "未通过") return "bg-red-50 text-red-700";
    return "bg-muted text-muted-foreground";
  };

  const notifyColor = (s: string) => {
    if (s === "已查看") return "bg-emerald-50 text-emerald-700";
    if (s === "已推送") return "bg-blue-50 text-blue-700";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <button onClick={backToTaskList} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />返回任务列表
      </button>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold">{task.title}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                由 {task.createdBy} 创建于 {task.createdAt} · 关联课件：{cws.map(c => c.title).join("、")} · {task.passingScore} 分及格 · 限时 {task.examDuration} 分钟
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => toast.success("Excel 导出成功")}>
                <Download className="h-3.5 w-3.5 mr-1" />导出 Excel
              </Button>
              <Button size="sm" className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 text-white rounded-lg" onClick={() => toast.success("已通知所有未完成的员工")}>
                <Bell className="h-3.5 w-3.5 mr-1" />一键催办
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-1 border-b">
        {(["list", "learn", "exam"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] transition-colors",
              tab === t ? "border-[#1E6FFF] text-[#1E6FFF]" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {t === "list" ? "参训名单" : t === "learn" ? "学习数据" : "考试数据"}
          </button>
        ))}
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium">姓名</th>
                <th className="text-left p-3 font-medium">推送状态</th>
                <th className="text-left p-3 font-medium">学习进度</th>
                <th className="text-left p-3 font-medium">考试分数</th>
                <th className="text-left p-3 font-medium">结果</th>
                <th className="text-left p-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {task.trainees.map(tr => {
                const emp = employees.find(e => e.id === tr.empId);
                if (!emp) return null;
                return (
                  <tr key={tr.empId} className={cn("border-b hover:bg-accent/30", tr.examScore !== null && tr.examScore < 60 && "bg-red-50/50")}>
                    <td className="p-3 font-medium">{emp.name}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className={cn("rounded-full text-[10px]", notifyColor(tr.notifyStatus))}>{tr.notifyStatus}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className={cn("rounded-full text-[10px]",
                        tr.learnStatus === "已完成" ? "bg-emerald-50 text-emerald-700" :
                        tr.learnStatus === "学习中" ? "bg-blue-50 text-blue-700" : "bg-muted text-muted-foreground"
                      )}>{tr.learnStatus} {tr.learnProgress > 0 && tr.learnStatus !== "已完成" ? `${tr.learnProgress}%` : ""}</Badge>
                    </td>
                    <td className="p-3 tabular-nums">{tr.examScore !== null ? `${tr.examScore} 分` : "—"}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className={cn("rounded-full text-[10px]", resultColor(tr.result))}>{tr.result}</Badge>
                    </td>
                    <td className="p-3">
                      {tr.notifyStatus === "未推送" && (
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => {
                          updateTrainee(task.id, tr.empId, { notifyStatus: "已推送" });
                          toast.success(`已催办 ${emp.name}`);
                        }}>催办</Button>
                      )}
                      {tr.result === "通过" && <span className="text-xs text-muted-foreground">查看详情</span>}
                      {tr.result === "未通过" && <span className="text-xs text-red-600">查看错题</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
