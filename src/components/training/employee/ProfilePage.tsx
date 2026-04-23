import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Award, Bell, Settings } from "lucide-react";
import { useTraining } from "../TrainingContext";
import { employees } from "../training-store";

export default function ProfilePage() {
  const { tasks, currentEmpId } = useTraining();
  const emp = employees.find(e => e.id === currentEmpId)!;

  const myCompleted = tasks.filter(t => t.trainees.some(tr => tr.empId === currentEmpId && tr.result === "通过"));
  const totalScore = myCompleted.reduce((s, t) => {
    const tr = t.trainees.find(r => r.empId === currentEmpId);
    return s + (tr?.examScore ?? 0);
  }, 0);
  const avgScore = myCompleted.length > 0 ? Math.round(totalScore / myCompleted.length) : 0;

  return (
    <div className="p-4 space-y-4">
      {/* Profile header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-sg-blue text-sg-blue-foreground flex items-center justify-center text-xl font-bold">{emp.avatar}</div>
        <div>
          <h1 className="text-base font-bold">{emp.name}</h1>
          <p className="text-xs text-muted-foreground">{emp.empNo} · {emp.dept}</p>
        </div>
      </div>

      {/* Stats card */}
      <Card className="rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">📊</span>
            <span className="text-sm font-semibold">我的学习数据</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold">12</p>
              <p className="text-[10px] text-muted-foreground">累计学习小时</p>
            </div>
            <div>
              <p className="text-lg font-bold">{myCompleted.length}</p>
              <p className="text-[10px] text-muted-foreground">完成培训</p>
            </div>
            <div>
              <p className="text-lg font-bold">{avgScore || "—"}</p>
              <p className="text-[10px] text-muted-foreground">平均分</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu items */}
      <div className="space-y-1">
        {[
          { icon: Award, label: "培训历史记录" },
          { icon: Bell, label: "消息通知" },
          { icon: Settings, label: "设置" },
        ].map(m => (
          <button key={m.label} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors">
            <m.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm flex-1 text-left">{m.label}</span>
            <span className="text-xs text-muted-foreground">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
