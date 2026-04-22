import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  FileUp,
  BrainCircuit,
  FileText,
  MonitorPlay,
  ClipboardCheck,
  Users,
} from "lucide-react";

const STEPS = [
  { id: "sec-kpi", n: "①", label: "材料导入", icon: FileUp },
  { id: "sec-scenario", n: "②", label: "AI 出题", icon: BrainCircuit },
  { id: "sec-todo", n: "③", label: "自动出卷", icon: FileText },
  { id: "sec-exams", n: "④", label: "在线考试", icon: MonitorPlay },
  { id: "sec-kb", n: "⑤", label: "批改留档", icon: ClipboardCheck },
  { id: "sec-onsite", n: "⑥", label: "在岗节点推进", icon: Users },
];

export function ProcessNavBar() {
  const [active, setActive] = useState(STEPS[0].id);

  useEffect(() => {
    const sectionEls = STEPS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!sectionEls.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );
    sectionEls.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
      <div className="flex items-center gap-1.5 px-6 py-2.5 overflow-x-auto no-scrollbar">
        {STEPS.map((s, i) => {
          const isActive = active === s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all duration-150 shrink-0",
                isActive
                  ? "bg-[hsl(239,84%,67%)] text-white border-[hsl(239,84%,67%)] shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-[hsl(239,84%,67%)]/40 hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{s.n}</span>
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
