import { useState } from "react";
import { Sparkles, FileUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { NewExamDialog } from "@/components/training/NewExamDialog";
import { ImportMaterialsSheet } from "@/components/training/ImportMaterialsSheet";
import { ProcessNavBar } from "@/components/training/ProcessNavBar";
import { KpiCards } from "@/components/training/KpiCards";
import { ScenarioOfflineCard } from "@/components/training/ScenarioOfflineCard";
import { ScenarioOnTheJobCard } from "@/components/training/ScenarioOnTheJobCard";
import { TodoList } from "@/components/training/TodoList";
import { RecentExams } from "@/components/training/RecentExams";
import { MenteeTimeline } from "@/components/training/MenteeTimeline";
import { QuestionBankGrid } from "@/components/training/QuestionBankGrid";

export default function Training() {
  const [examOpen, setExamOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <PageHeader
        title="培训助手"
        description="围绕 出卷-考试-改卷-留档 与 在岗节点推进-记录汇总 的一体化 AI 助手"
        actions={
          <>
            <Button size="sm" className="bg-[hsl(239,84%,67%)] hover:bg-[hsl(239,84%,67%)]/90 text-white" onClick={() => setExamOpen(true)}>
              <Sparkles className="h-4 w-4 mr-1.5" />AI 一键出卷
            </Button>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <FileUp className="h-4 w-4 mr-1.5" />导入培训材料
            </Button>
          </>
        }
      />

      {/* Sticky process nav */}
      <ProcessNavBar />

      {/* Sections */}
      <div className="p-6 space-y-12">
        {/* § 1 — KPI */}
        <section id="sec-kpi">
          <SectionHead color="purple" title="关键指标" />
          <KpiCards />
        </section>

        {/* § 2 — Core scenarios */}
        <section id="sec-scenario">
          <SectionHead color="purple" title="核心业务闭环" sub="脱岗培训解决"会不会"，在岗培训解决"熟不熟"" />
          <div className="grid gap-4 xl:grid-cols-2">
            <ScenarioOfflineCard />
            <ScenarioOnTheJobCard />
          </div>
        </section>

        {/* § 3 — Todos */}
        <section id="sec-todo">
          <SectionHead color="green" title="待办任务" />
          <TodoList />
        </section>

        {/* § 4 — Exams + Timeline */}
        <section id="sec-exams">
          <SectionHead color="purple" title="近期考试 & 培训进度" />
          <div className="grid gap-4 lg:grid-cols-2">
            <RecentExams />
            <MenteeTimeline />
          </div>
        </section>

        {/* § 5 — Question banks */}
        <section id="sec-kb">
          <SectionHead color="green" title="题库与知识沉淀" sub="支持激光打标 · 太阳能装配 · 质量体系 · 外贸销售等岗位知识图谱" />
          <QuestionBankGrid />
        </section>

        {/* § 6 — On-site anchor (for nav bar) */}
        <div id="sec-onsite" className="sr-only" />
      </div>

      <NewExamDialog open={examOpen} onClose={() => setExamOpen(false)} />
      <ImportMaterialsSheet open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}

/* ── Section header with colored bar ── */
function SectionHead({ color, title, sub }: { color: "purple" | "green"; title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <div className={`w-8 h-1 rounded-full mb-3 ${color === "purple" ? "bg-[hsl(239,84%,67%)]" : "bg-[hsl(160,59%,46%)]"}`} />
      <h2 className="text-lg font-semibold">{title}</h2>
      {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
