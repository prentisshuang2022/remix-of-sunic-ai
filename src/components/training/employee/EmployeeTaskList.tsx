import { useState } from "react";
import { useTraining } from "../TrainingContext";
import { typeConfig, coursewares } from "../training-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ClipboardCheck, Trophy, ArrowLeft } from "lucide-react";

export default function EmployeeTaskList() {
  const { tasks, currentEmpId, empTaskId, setEmpTaskId, setEmpView, updateTrainee } = useTraining();
  const [collapsed, setCollapsed] = useState(true);

  const myTasks = tasks.filter(t => t.status !== "draft" && t.trainees.some(tr => tr.empId === currentEmpId));
  const getRecord = (taskId: string) => tasks.find(t => t.id === taskId)?.trainees.find(tr => tr.empId === currentEmpId);

  const inProgress = myTasks.filter(t => { const r = getRecord(t.id); return r && r.result === "未完成" && r.learnStatus !== "未开始"; });
  const notStarted = myTasks.filter(t => { const r = getRecord(t.id); return r && r.result === "未完成" && r.learnStatus === "未开始"; });
  const completed = myTasks.filter(t => { const r = getRecord(t.id); return r && r.result !== "未完成"; });

  const toLearn = myTasks.filter(t => { const r = getRecord(t.id); return r && r.learnStatus !== "已完成" && r.result === "未完成"; }).length;
  const toExam = myTasks.filter(t => { const r = getRecord(t.id); return r && r.learnStatus === "已完成" && r.examScore === null && r.result === "未完成"; }).length;
  const doneCount = completed.length;

  if (empTaskId) {
    const task = tasks.find(t => t.id === empTaskId);
    const record = getRecord(empTaskId);
    if (!task || !record) return null;
    const tc = typeConfig[task.type];
    const cws = task.coursewareIds.map(id => coursewares.find(c => c.id === id)).filter(Boolean);
    const daysLeft = Math.max(0, Math.ceil((new Date(task.deadline).getTime() - Date.now()) / 86400000));

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setEmpTaskId(null)}><ArrowLeft className="h-4 w-4 mr-1" />返回列表</Button>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={`${tc.bg} ${tc.text} border ${tc.border} text-xs`}>{tc.label}</Badge>
              <h2 className="font-semibold">{task.title}</h2>
              <span className="text-xs text-orange-600 ml-auto">剩余 {daysLeft} 天</span>
            </div>
            <p className="text-xs text-muted-foreground">{cws.length} 份素材 · {task.examQuestionCount} 题 · 及格分 {task.passingScore}</p>

            <div className="space-y-3">
              <Card className={`rounded-xl border-l-4 ${record.learnStatus === "已完成" ? "border-l-emerald-500" : "border-l-[#1E6FFF]"}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-[#1E6FFF]" />
                    <div>
                      <p className="text-sm font-medium">Step 1 · 学习课件</p>
                      <p className="text-xs text-muted-foreground">{cws.map(c => c!.title).join("、")}</p>
                    </div>
                  </div>
                  {record.learnStatus === "已完成" ? (
                    <Badge className="bg-emerald-50 text-emerald-700 text-xs">✅ 已完成</Badge>
                  ) : (
                    <Button size="sm" className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg text-xs" onClick={() => {
                      updateTrainee(task.id, currentEmpId, { notifyStatus: "已查看", learnStatus: "学习中" });
                      setEmpView("learning");
                    }}>{record.learnStatus === "学习中" ? "继续学习 →" : "开始学习 →"}</Button>
                  )}
                </CardContent>
              </Card>

              <Card className={`rounded-xl border-l-4 ${record.result === "通过" ? "border-l-emerald-500" : record.learnStatus === "已完成" ? "border-l-[#1E6FFF]" : "border-l-gray-200"}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="h-5 w-5 text-[#1E6FFF]" />
                    <div>
                      <p className="text-sm font-medium">Step 2 · 参加考试</p>
                      <p className="text-xs text-muted-foreground">{task.examQuestionCount} 题 · {task.examDuration} 分钟 · 及格 {task.passingScore} 分</p>
                    </div>
                  </div>
                  {record.result === "通过" ? (
                    <Badge className="bg-emerald-50 text-emerald-700 text-xs">✅ {record.examScore} 分</Badge>
                  ) : record.result === "未通过" ? (
                    <Badge className="bg-red-50 text-red-700 text-xs">❌ {record.examScore} 分</Badge>
                  ) : record.learnStatus !== "已完成" ? (
                    <span className="text-xs text-muted-foreground">需先完成学习</span>
                  ) : (
                    <Button size="sm" className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg text-xs" onClick={() => setEmpView("exam")}>参加考试 →</Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderTaskCard = (t: typeof myTasks[0]) => {
    const record = getRecord(t.id)!;
    const tc = typeConfig[t.type];
    const daysLeft = Math.max(0, Math.ceil((new Date(t.deadline).getTime() - Date.now()) / 86400000));
    const cws = t.coursewareIds.map(id => coursewares.find(c => c.id === id)).filter(Boolean);

    let actionBtn;
    if (record.result === "通过") actionBtn = <Button variant="ghost" size="sm" className="text-xs">查看成绩</Button>;
    else if (record.result === "未通过") actionBtn = <Button variant="ghost" size="sm" className="text-xs text-red-600" onClick={() => { setEmpTaskId(t.id); }}>查看错题</Button>;
    else if (record.learnStatus === "已完成") actionBtn = <Button size="sm" className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg text-xs" onClick={() => { setEmpTaskId(t.id); setEmpView("exam"); }}>参加考试 →</Button>;
    else actionBtn = <Button size="sm" className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg text-xs" onClick={() => { setEmpTaskId(t.id); }}>继续学习 →</Button>;

    return (
      <Card key={t.id} className={`rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow ${record.result === "未完成" && record.learnStatus !== "未开始" ? "border-l-4 border-l-red-400" : ""}`} onClick={() => setEmpTaskId(t.id)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${tc.bg} ${tc.text} border ${tc.border} text-xs`}>{tc.label}</Badge>
              <span className="font-medium text-sm">{t.title}</span>
            </div>
            <span className="text-xs text-orange-600">剩余 {daysLeft} 天</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{cws.length} 份素材 · {t.examQuestionCount} 题 · 及格分 {t.passingScore}</p>
          <div className="flex items-center justify-between mt-2">
            <Progress value={record.learnProgress} className="h-1.5 flex-1 mr-4" />
            {actionBtn}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "待学习", value: toLearn, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
          { label: "待考试", value: toExam, icon: ClipboardCheck, color: "text-purple-600 bg-purple-50" },
          { label: "本月已完成", value: doneCount, icon: Trophy, color: "text-emerald-600 bg-emerald-50" },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2 rounded-xl ${s.color}`}><s.icon className="h-4 w-4" /></div>
              <div><p className="text-xl font-bold tabular-nums">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {inProgress.length > 0 && (
        <div><h3 className="text-sm font-semibold mb-2 text-red-600">进行中</h3><div className="space-y-3">{inProgress.map(renderTaskCard)}</div></div>
      )}
      {notStarted.length > 0 && (
        <div><h3 className="text-sm font-semibold mb-2">待开始</h3><div className="space-y-3">{notStarted.map(renderTaskCard)}</div></div>
      )}
      {completed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>已完成 ({completed.length}) {collapsed ? "▸" : "▾"}</h3>
          {!collapsed && <div className="space-y-3">{completed.map(renderTaskCard)}</div>}
        </div>
      )}
    </div>
  );
}
