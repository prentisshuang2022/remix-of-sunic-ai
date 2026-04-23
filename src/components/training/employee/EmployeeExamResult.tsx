import { useState, useEffect } from "react";
import { useTraining } from "../TrainingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function EmployeeExamResult() {
  const { empExamResult, setEmpView, setEmpTaskId } = useTraining();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!empExamResult) return null;
  const { score, result, correctCount, totalCount, timeSpent, weakTopics, strongTopics, deptRank } = empExamResult;
  const passed = result === "通过";
  const mm = Math.floor(timeSpent / 60);
  const ss = timeSpent % 60;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#1E6FFF] mx-auto" />
          <p className="text-lg font-medium">AI 正在批阅试卷...</p>
          <p className="text-sm text-muted-foreground">正在分析答题数据，生成学习诊断报告</p>
        </div>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 50;
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6 bg-muted/20">
      <div className="max-w-3xl w-full space-y-6">
        <div className={`p-6 rounded-2xl text-center ${passed ? "bg-gradient-to-r from-emerald-50 to-green-50" : "bg-gradient-to-r from-gray-50 to-slate-50"}`}>
          <div className="text-4xl mb-2">{passed ? "🎉" : "😔"}</div>
          <h1 className={`text-2xl font-bold ${passed ? "text-emerald-700" : "text-gray-700"}`}>
            {passed ? "恭喜通过！" : "很遗憾，未通过"}
          </h1>
          {!passed && <p className="text-sm text-muted-foreground mt-1">距及格分还差 {(empExamResult.questions[0] ? 80 : 80) - score} 分</p>}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={passed ? "#10B981" : "#EF4444"}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold tabular-nums">{score}</span>
                </div>
              </div>
              <div className="flex gap-6 text-center text-sm">
                <div><p className="font-semibold tabular-nums">{correctCount}/{totalCount}</p><p className="text-xs text-muted-foreground">答对题数</p></div>
                <div><p className="font-semibold tabular-nums">{mm}:{String(ss).padStart(2, "0")}</p><p className="text-xs text-muted-foreground">用时</p></div>
                <div><p className="font-semibold tabular-nums">第 {deptRank.rank}/{deptRank.total}</p><p className="text-xs text-muted-foreground">部门排名</p></div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">📊 AI 学习{passed ? "分析" : "诊断"}</h3>

              {passed && strongTopics.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-emerald-700 mb-2">✅ 掌握良好</p>
                  {strongTopics.map(t => (
                    <div key={t.topic} className="flex items-center justify-between text-sm mb-1">
                      <span>{t.topic}</span>
                      <span className="tabular-nums text-emerald-600">{t.correctRate}%</span>
                    </div>
                  ))}
                </div>
              )}

              {weakTopics.length > 0 && (
                <div className="mb-4">
                  <p className={`text-sm font-medium mb-2 ${passed ? "text-orange-600" : "text-red-600"}`}>{passed ? "⚠️ 建议加强" : "❌ 薄弱知识点"}</p>
                  {weakTopics.map(t => (
                    <div key={t.topic} className="mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t.topic}</span>
                        <span className={`tabular-nums ${t.correctRate < 50 ? "text-red-600" : "text-orange-600"}`}>{t.correctRate}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full mt-1">
                        <div className={`h-full rounded-full ${t.correctRate < 50 ? "bg-red-500" : "bg-orange-500"}`} style={{ width: `${t.correctRate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                {passed
                  ? "整体表现良好，建议后续关注薄弱知识点的巩固学习。"
                  : "建议重点复习薄弱知识点对应的培训素材，加强理解后再次尝试。"
                }
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="outline" className="rounded-xl" onClick={() => setEmpView("errorReview")}>查看错题解析</Button>
          <Button className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-xl" onClick={() => { setEmpTaskId(null); setEmpView("taskList"); }}>返回任务列表</Button>
        </div>
      </div>
    </div>
  );
}
