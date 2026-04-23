import { useTraining } from "../TrainingContext";
import { employees } from "../training-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function EmployeeArchive() {
  const { tasks, currentEmpId } = useTraining();
  const emp = employees.find(e => e.id === currentEmpId)!;

  const myRecords = tasks
    .filter(t => t.status !== "draft")
    .flatMap(t => {
      const tr = t.trainees.find(r => r.empId === currentEmpId);
      if (!tr || tr.result === "未完成") return [];
      return [{ task: t, record: tr }];
    })
    .sort((a, b) => (b.record.submittedAt ?? "").localeCompare(a.record.submittedAt ?? ""));

  const totalCount = myRecords.length;
  const passCount = myRecords.filter(r => r.record.result === "通过").length;
  const passRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
  const avgScore = totalCount > 0 ? Math.round(myRecords.reduce((s, r) => s + (r.record.examScore ?? 0), 0) / totalCount) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1E6FFF] text-white flex items-center justify-center text-lg font-bold">{emp.avatar}</div>
          <div><p className="font-semibold">{emp.name}</p><p className="text-xs text-muted-foreground">{emp.empNo} · {emp.dept}</p></div>
        </div>
        <Button variant="outline" size="sm" className="rounded-lg" onClick={() => toast.success("PDF 导出成功")}><Download className="h-3.5 w-3.5 mr-1" />导出培训档案</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-sm"><CardContent className="p-3 text-center"><p className="text-xl font-bold tabular-nums">{totalCount} 次</p><p className="text-xs text-muted-foreground">累计参训</p></CardContent></Card>
        <Card className="rounded-2xl shadow-sm"><CardContent className="p-3 text-center"><p className="text-xl font-bold tabular-nums">{passRate}%</p><p className="text-xs text-muted-foreground">通过率</p></CardContent></Card>
        <Card className="rounded-2xl shadow-sm"><CardContent className="p-3 text-center"><p className="text-xl font-bold tabular-nums">{avgScore}</p><p className="text-xs text-muted-foreground">平均分</p></CardContent></Card>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">培训时间轴</h3>
        <div className="space-y-3">
          {myRecords.length === 0 && <p className="text-sm text-muted-foreground">暂无已完成的培训记录</p>}
          {myRecords.map(({ task: t, record: r }) => (
            <Card key={t.id} className="rounded-xl shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{r.submittedAt}</span>
                <span className="flex-1 text-sm font-medium">{t.title}</span>
                <Badge className={r.result === "通过" ? "bg-emerald-50 text-emerald-700 text-xs" : "bg-red-50 text-red-700 text-xs"}>{r.result}</Badge>
                <span className="tabular-nums text-sm w-14 text-right">{r.examScore} 分</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
