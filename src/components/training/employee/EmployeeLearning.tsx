import { useState } from "react";
import { useTraining } from "../TrainingContext";
import { coursewares } from "../training-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export default function EmployeeLearning() {
  const { empTaskId, tasks, currentEmpId, setEmpView, updateTrainee } = useTraining();
  const task = tasks.find(t => t.id === empTaskId);
  const cwList = task?.coursewareIds.map(id => coursewares.find(c => c.id === id)).filter(Boolean) ?? [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const progress = cwList.length > 0 ? Math.round((completed.size / cwList.length) * 100) : 0;
  const allDone = completed.size === cwList.length && cwList.length > 0;
  const cw = cwList[currentIdx];

  const markDone = () => {
    const next = new Set(completed);
    next.add(currentIdx);
    setCompleted(next);
    if (next.size === cwList.length && task) {
      updateTrainee(task.id, currentEmpId, { learnStatus: "已完成", learnProgress: 100 });
    } else if (task) {
      updateTrainee(task.id, currentEmpId, { learnStatus: "学习中", learnProgress: Math.round((next.size / cwList.length) * 100) });
    }
  };

  const goNext = () => { if (currentIdx < cwList.length - 1) setCurrentIdx(currentIdx + 1); };
  const goPrev = () => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1); };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <h2 className="font-semibold text-sm">{task?.title} — 学习课件</h2>
        <Button variant="ghost" size="icon" onClick={() => setEmpView("taskDetail")}><X className="h-4 w-4" /></Button>
      </div>

      {allDone && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 flex items-center justify-between animate-pulse">
          <span className="text-sm font-medium text-emerald-700">✅ 学习完成！</span>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs" onClick={() => setEmpView("exam")}>立即参加考试 →</Button>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <div className="w-64 border-r bg-muted/20 p-4 space-y-2 overflow-y-auto shrink-0">
          <p className="text-xs text-muted-foreground mb-2">素材目录 · 进度 {progress}%</p>
          {cwList.map((c, i) => {
            const isDone = completed.has(i);
            const isCurrent = i === currentIdx;
            return (
              <button key={i} onClick={() => setCurrentIdx(i)}
                className={`w-full text-left p-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${isCurrent ? "bg-[#1E6FFF]/10 text-[#1E6FFF] font-medium" : "hover:bg-muted/50"}`}>
                {isDone ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> : isCurrent ? <span className="w-4 h-4 rounded-full border-2 border-[#1E6FFF] shrink-0" /> : <span className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                {c!.title}
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-muted/10 p-8">
            {cw && (
              <div className="text-center space-y-4">
                <div className="text-6xl">{cw.type === "video" ? "▶️" : "📄"}</div>
                <h3 className="text-lg font-semibold">{cw.title}</h3>
                <p className="text-sm text-muted-foreground">{cw.type} · {cw.pages ? `${cw.pages} 页` : cw.duration}</p>
                <p className="text-xs text-muted-foreground">（课件内容展示区占位）</p>
              </div>
            )}
          </div>

          <div className="border-t p-4 flex items-center justify-between bg-card">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={goPrev} disabled={currentIdx === 0}><ChevronLeft className="h-4 w-4 mr-1" />上一节</Button>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="w-32 h-2" />
              <span className="text-xs text-muted-foreground tabular-nums">{progress}%</span>
            </div>
            {completed.has(currentIdx) ? (
              <Button variant="outline" size="sm" className="rounded-lg" onClick={goNext} disabled={currentIdx === cwList.length - 1}>下一节<ChevronRight className="h-4 w-4 ml-1" /></Button>
            ) : (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg" onClick={markDone}>标记已学 ✓</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
