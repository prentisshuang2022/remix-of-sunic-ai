import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTraining } from "../TrainingContext";
import { getExamQuestions, type Question } from "../training-store";

export default function ExamPage() {
  const { empTaskId, tasks, currentEmpId, setEmpExamActive, setEmpExamResult, updateTrainee } = useTraining();
  const task = tasks.find(t => t.id === empTaskId);
  const [confirmed, setConfirmed] = useState(false);
  const [questions] = useState<Question[]>(() => getExamQuestions(empTaskId ?? ""));
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState((task?.examDuration ?? 30) * 60);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (!confirmed) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [confirmed]);

  const submit = useCallback(() => {
    // Simulate scoring: random between 58-96
    const score = Math.floor(Math.random() * 39) + 58;
    const passed = score >= (task?.passingScore ?? 80);
    if (task) {
      updateTrainee(task.id, currentEmpId, {
        examScore: score,
        result: passed ? "通过" : "未通过",
      });
    }
    setEmpExamActive(false);
    setEmpExamResult({ passed, score });
  }, [task, currentEmpId, updateTrainee, setEmpExamActive, setEmpExamResult]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  if (!confirmed) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center space-y-4 max-w-xs">
          <div className="text-4xl">📝</div>
          <h2 className="text-base font-bold">准备好了吗？</h2>
          <p className="text-sm text-muted-foreground">
            本次考试共 {questions.length} 题，限时 {task?.examDuration ?? 30} 分钟，中途不可退出。
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" className="rounded-lg" onClick={() => setEmpExamActive(false)}>取消</Button>
            <Button className="bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-lg" onClick={() => setConfirmed(true)}>确认开始</Button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const isMulti = q.type === "多选";
  const isJudge = q.type === "判断";
  const options = isJudge ? ["正确", "错误"] : (q.options ?? []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 p-3 border-b bg-card flex items-center justify-between">
        <div className="text-xs font-medium truncate max-w-[50%]">{task?.title}</div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-sg-blue font-bold">{mm}:{ss}</span>
          <span className="text-muted-foreground">已答 {Object.keys(answers).length}/{questions.length}</span>
          <button onClick={() => setShowCard(!showCard)} className="text-sg-blue underline">答题卡</button>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {showCard && (
          <div className="absolute inset-0 bg-card z-10 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">答题卡</h3>
              <button onClick={() => setShowCard(false)} className="text-xs text-muted-foreground">关闭</button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button key={i} onClick={() => { setCurrent(i); setShowCard(false); }}
                  className={cn("w-10 h-10 rounded-lg text-xs font-medium",
                    i === current ? "bg-sg-blue text-sg-blue-foreground" :
                    answers[i] ? "bg-sg-blue-soft text-sg-blue" : "bg-muted text-muted-foreground")}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">第 {current + 1} 题</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sg-blue-soft text-sg-blue">{q.type}</span>
        </div>
        <p className="text-sm font-medium leading-relaxed">{q.text}</p>
        <div className="space-y-2">
          {options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const selected = answers[current] === letter;
            return (
              <button
                key={i}
                onClick={() => setAnswers(prev => ({ ...prev, [current]: letter }))}
                className={cn(
                  "w-full text-left p-3 rounded-xl border text-sm transition-colors",
                  selected ? "border-sg-blue bg-sg-blue-soft" : "border-border hover:bg-accent/30"
                )}
              >
                <span className={cn("inline-block w-5 h-5 rounded-full text-center text-xs leading-5 mr-2",
                  selected ? "bg-sg-blue text-sg-blue-foreground" : "bg-muted text-muted-foreground")}>{letter}</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-3 border-t bg-card flex items-center justify-between">
        <Button variant="outline" size="sm" className="rounded-lg" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>上一题</Button>
        {current === questions.length - 1 ? (
          <Button size="sm" className="bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-lg" onClick={submit}>交卷</Button>
        ) : (
          <Button size="sm" className="bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-lg" onClick={() => setCurrent(c => c + 1)}>下一题</Button>
        )}
      </div>
    </div>
  );
}
