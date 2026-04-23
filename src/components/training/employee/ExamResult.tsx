import { Button } from "@/components/ui/button";
import { useTraining } from "../TrainingContext";

export default function ExamResult() {
  const { empExamResult, setEmpExamResult, setEmpTaskId, setEmpTab } = useTraining();
  if (!empExamResult) return null;

  const { passed, score } = empExamResult;

  const goHome = () => {
    setEmpExamResult(null);
    setEmpTaskId(null);
    setEmpTab("home");
  };

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center space-y-5 max-w-xs">
        {passed ? (
          <>
            <div className="text-6xl">✅</div>
            <h1 className="text-xl font-bold text-success">恭喜通过！</h1>
          </>
        ) : (
          <>
            <div className="text-6xl">⚠️</div>
            <h1 className="text-xl font-bold text-warning">本次未通过</h1>
          </>
        )}

        {/* Score ring */}
        <div className="relative w-28 h-28 mx-auto">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <circle cx="60" cy="60" r="50" fill="none"
              stroke={passed ? "hsl(var(--success))" : "hsl(var(--warning))"}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 314} 314`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{score}</span>
          </div>
        </div>

        {passed ? (
          <p className="text-sm text-muted-foreground">客观题已自动评分，本次成绩已记录到你的培训档案</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{score} 分，及格 80 分</p>
            <p className="text-xs text-muted-foreground">系统已为你安排补考<br/>建议：重新学习课件后再参加补考</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {!passed && (
            <Button className="w-full bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-lg" onClick={goHome}>重新学习</Button>
          )}
          <Button variant={passed ? "default" : "outline"} className={passed ? "w-full bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-lg" : "w-full rounded-lg"} onClick={goHome}>
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}
