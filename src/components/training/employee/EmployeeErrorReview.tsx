import { useTraining } from "../TrainingContext";
import { coursewares } from "../training-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export default function EmployeeErrorReview() {
  const { empExamResult, setEmpView, setEmpTaskId } = useTraining();
  if (!empExamResult) return null;

  const { questions: qs, answers } = empExamResult;
  const wrongQs = qs.filter(q => answers[q.id] !== q.answer);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b px-4 py-3 flex items-center gap-3 bg-card">
        <Button variant="ghost" size="icon" onClick={() => setEmpView("examResult")}><ArrowLeft className="h-4 w-4" /></Button>
        <h2 className="font-semibold text-sm">错题解析 · 共 {wrongQs.length} 题</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {wrongQs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-lg font-medium">全部答对！</p>
            </div>
          ) : (
            wrongQs.map((q, i) => {
              const userAnswer = answers[q.id] || "未作答";
              const cw = coursewares.find(c => c.id === q.coursewareId);
              return (
                <Card key={q.id} className="rounded-2xl shadow-sm">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-red-600">错题 {i + 1}</span>
                      <Badge variant="outline" className="text-xs">{q.type === "single" ? "单选" : "判断"}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{q.topic}</span>
                    </div>
                    <p className="text-sm">{q.text}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, j) => {
                        const isCorrect = opt === q.answer;
                        const isUserWrong = opt === userAnswer && !isCorrect;
                        return (
                          <div key={j} className={`p-2 rounded-lg text-sm ${isCorrect ? "bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium" : isUserWrong ? "bg-red-50 border border-red-200 text-red-700 line-through" : "bg-muted/30"}`}>
                            <span className="inline-block w-5">{String.fromCharCode(65 + j)}.</span>
                            {opt}
                            {isCorrect && " ✓"}
                            {isUserWrong && " ✗ 你的答案"}
                          </div>
                        );
                      })}
                      {userAnswer === "未作答" && <p className="text-xs text-red-500">你未作答此题</p>}
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50/50 text-xs text-blue-800">
                      <strong>解析：</strong>{q.explanation}
                    </div>
                    {cw && (
                      <p className="text-xs text-muted-foreground">相关素材：《{cw.title}》</p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}

          <div className="flex justify-center pt-4">
            <Button className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-xl" onClick={() => { setEmpTaskId(null); setEmpView("taskList"); }}>返回任务列表</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
