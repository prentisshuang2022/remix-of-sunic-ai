import { useState } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { NewExamDialog } from "@/components/training/NewExamDialog";
import { TodayActionBar } from "@/components/training/TodayActionBar";
import { KpiCards } from "@/components/training/KpiCards";
import { ScenarioOfflineCard } from "@/components/training/ScenarioOfflineCard";
import { ScenarioOnTheJobCard } from "@/components/training/ScenarioOnTheJobCard";
import { RecentExams } from "@/components/training/RecentExams";
import { MenteeTimeline } from "@/components/training/MenteeTimeline";
import { QuestionBankGrid } from "@/components/training/QuestionBankGrid";

export default function Training() {
  const [examOpen, setExamOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="培训助手"
        description="出卷·考试·改卷·留档 / 在岗节点推进·跨厂区汇总"
        actions={
          <Button size="sm" className="bg-train-offline hover:bg-train-offline/90 text-train-offline-foreground" onClick={() => setExamOpen(true)}>
            <Sparkles className="h-4 w-4 mr-1.5" />AI 一键出卷
          </Button>
        }
      />

      <div className="p-6 space-y-10">
        {/* § 1 — Today action bar */}
        <TodayActionBar />

        {/* § 2 — KPI */}
        <section>
          <SectionHead color="offline" title="关键指标" />
          <KpiCards />
        </section>

        {/* § 3 — Core scenarios */}
        <section>
          <SectionHead color="offline" title="核心业务闭环" sub="脱岗解决'会不会'，在岗解决'熟不熟'" />
          <div className="grid gap-4 xl:grid-cols-2">
            <ScenarioOfflineCard />
            <ScenarioOnTheJobCard />
          </div>
        </section>

        {/* § 4 — Exams + Timeline */}
        <section>
          <SectionHead color="onsite" title="近期考试 & 学徒节点" />
          <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
            <RecentExams />
            <MenteeTimeline />
          </div>
        </section>

        {/* § 5 — Question banks */}
        <section>
          <SectionHead color="onsite" title="岗位题库" sub="支持激光打标·太阳能装配·质量体系·外贸销售等岗位知识图谱" link="管理题库 →" />
          <QuestionBankGrid />
        </section>
      </div>

      <NewExamDialog open={examOpen} onClose={() => setExamOpen(false)} />
    </div>
  );
}

/* ── Section header ── */
function SectionHead({ color, title, sub, link }: { color: "offline" | "onsite"; title: string; sub?: string; link?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <div className={`w-8 h-1 rounded-full mb-3 ${color === "offline" ? "bg-train-offline" : "bg-train-onsite"}`} />
        <h2 className="text-lg font-semibold">{title}</h2>
        {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {link && <span className="text-xs text-train-offline hover:underline cursor-pointer">{link}</span>}
    </div>
  );
}
