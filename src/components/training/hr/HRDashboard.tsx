import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, TrendingUp, AlertCircle, Plus, Upload, PenLine } from "lucide-react";
import { useTraining } from "../TrainingContext";
import { typeConfig, statusConfig } from "../training-store";

export default function HRDashboard() {
  const { tasks, setHRTab } = useTraining();
  const active = tasks.filter(t => t.status === "inProgress");

  // KPI from real data
  const allTrainees = tasks.filter(t => t.status === "inProgress").flatMap(t => t.trainees);
  const monthParticipants = allTrainees.filter(tr => tr.notifyStatus !== "未推送").length;
  const examined = allTrainees.filter(tr => tr.examScore !== null);
  const passRate = examined.length > 0 ? Math.round((examined.filter(tr => tr.result === "通过").length / examined.length) * 100) : 0;
  const unfinished = allTrainees.filter(tr => tr.result === "未完成").length;

  const stats = [
    { label: "进行中任务", value: active.length, icon: BookOpen, color: "text-[#1E6FFF]", bg: "bg-blue-50" },
    { label: "本月参训人次", value: monthParticipants, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "平均通过率", value: `${passRate}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "未完成人数", value: unfinished, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const trendData = [32, 18, 24, 28, 22, 36, 30];
  const maxTrend = Math.max(...trendData);
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="rounded-2xl shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`${s.bg} rounded-xl p-2`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid lg:grid-cols-[3fr_2fr] gap-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold">当前任务进度</h3>
            {active.slice(0, 5).map(t => {
              const done = t.trainees.filter(r => r.result === "通过").length;
              const pct = t.headcount > 0 ? Math.round((done / t.headcount) * 100) : 0;
              return (
                <div key={t.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate max-w-[200px]">{t.title}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">{done}/{t.headcount} 人完成</span>
                  </div>
                  <Progress value={pct} className="h-2 rounded-full" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4">最近 7 天参训趋势</h3>
            <div className="flex items-end gap-2 h-28">
              {trendData.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#1E6FFF]/80 rounded-t-md transition-all hover:bg-[#1E6FFF]"
                    style={{ height: `${(v / maxTrend) * 100}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{days[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-4">快捷操作</h3>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 text-white rounded-xl h-12 px-6" onClick={() => setHRTab("tasks")}>
              <Plus className="h-4 w-4 mr-1.5" />派新培训
            </Button>
            <Button variant="outline" className="rounded-xl h-12 px-6" onClick={() => setHRTab("materials")}>
              <Upload className="h-4 w-4 mr-1.5" />上传素材
            </Button>
            <Button variant="outline" className="rounded-xl h-12 px-6" onClick={() => setHRTab("materials")}>
              <PenLine className="h-4 w-4 mr-1.5" />新增题目
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
