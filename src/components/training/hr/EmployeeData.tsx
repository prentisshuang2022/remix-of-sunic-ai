import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { employees, deptStats } from "../training-store";
import { useTraining } from "../TrainingContext";

interface HistoryItem {
  date: string;
  title: string;
  passed: boolean;
  score: number;
}

const empHistory: Record<string, HistoryItem[]> = {
  e1: [
    { date: "2026-04-15", title: "SMT 操作规范", passed: true, score: 92 },
    { date: "2026-03-20", title: "无尘车间规范", passed: true, score: 85 },
    { date: "2026-02-10", title: "新员工入职培训", passed: true, score: 88 },
  ],
  e2: [
    { date: "2026-04-12", title: "LED 封装工艺入门", passed: true, score: 90 },
    { date: "2026-03-15", title: "新员工入职培训", passed: true, score: 92 },
  ],
  e3: [
    { date: "2026-04-10", title: "静电防护 ESD", passed: true, score: 78 },
  ],
  e4: [
    { date: "2026-04-20", title: "新员工入职培训", passed: false, score: 58 },
  ],
  e5: [
    { date: "2026-04-18", title: "无尘车间规范复训", passed: true, score: 85 },
    { date: "2026-03-25", title: "新员工入职培训", passed: true, score: 88 },
  ],
};

export default function EmployeeData() {
  const [tab, setTab] = useState<"archive" | "dept">("archive");
  const [search, setSearch] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<string | null>("e1");

  const filtered = employees.filter(e =>
    e.name.includes(search) || e.empNo.includes(search) || e.dept.includes(search)
  );

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">员工与数据</h1>
        {tab === "dept" && (
          <Button variant="outline" size="sm" className="rounded-lg">
            <Download className="h-3.5 w-3.5 mr-1" />导出月度报表
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b">
        {(["archive", "dept"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] transition-colors",
              tab === t ? "border-sg-blue text-sg-blue" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t === "archive" ? "员工档案" : "部门统计"}
          </button>
        ))}
      </div>

      {tab === "archive" && (
        <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
          {/* Left: employee list */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索工号/姓名/部门" className="pl-9 rounded-lg" />
            </div>
            <div className="space-y-1">
              {filtered.map(e => (
                <button key={e.id} onClick={() => setSelectedEmp(e.id)}
                  className={cn("w-full flex items-center gap-3 p-3 rounded-lg text-sm text-left transition-colors",
                    selectedEmp === e.id ? "bg-sg-blue-soft" : "hover:bg-accent")}>
                  <div className="w-8 h-8 rounded-full bg-sg-blue text-sg-blue-foreground flex items-center justify-center text-xs font-medium">{e.avatar}</div>
                  <div>
                    <p className="font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.empNo} · {e.dept}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: training history */}
          <Card className="rounded-xl">
            <CardContent className="p-5">
              {selectedEmp ? (
                <>
                  <h3 className="text-sm font-semibold mb-4">培训历史</h3>
                  <div className="space-y-3">
                    {(empHistory[selectedEmp] ?? []).map((h, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="mt-0.5">
                          <CheckCircle className={cn("h-4 w-4", h.passed ? "text-success" : "text-danger")} />
                        </div>
                        <div>
                          <p className="font-medium">{h.date}　《{h.title}》</p>
                          <p className="text-xs text-muted-foreground">
                            {h.passed ? "✅ 通过" : "❌ 未通过"}　{h.score} 分
                          </p>
                        </div>
                      </div>
                    ))}
                    {!(empHistory[selectedEmp]?.length) && (
                      <p className="text-muted-foreground text-sm">暂无培训记录</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">请选择左侧员工查看记录</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "dept" && (
        <div className="space-y-4">
          {/* Bar chart simple */}
          <Card className="rounded-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold">各部门参训率 / 通过率</h3>
              {deptStats.map(d => (
                <div key={d.dept} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{d.dept}</span>
                    <span className="text-xs text-muted-foreground">参训 {d.trainRate}% · 通过 {d.passRate}%</span>
                  </div>
                  <div className="flex gap-1 h-3">
                    <div className="bg-sg-blue rounded-full" style={{ width: `${d.trainRate}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-3">待完成 Top 3 员工</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>赵磊（SMT组）</span><Badge variant="secondary" className="bg-danger-soft text-danger rounded-full text-[10px]">3 项未完成</Badge></div>
                <div className="flex justify-between"><span>王强（品质部）</span><Badge variant="secondary" className="bg-warning-soft text-warning rounded-full text-[10px]">2 项未完成</Badge></div>
                <div className="flex justify-between"><span>李娜（封装组）</span><Badge variant="secondary" className="bg-warning-soft text-warning rounded-full text-[10px]">1 项未完成</Badge></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
