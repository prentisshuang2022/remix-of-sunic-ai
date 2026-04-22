import { Card } from "@/components/ui/card";
import { Cpu, Sun, ShieldCheck, Globe } from "lucide-react";

const BANKS = [
  { icon: Cpu, label: "激光设备操作", count: 412, templates: 18, color: "text-train-offline", bg: "bg-train-offline-soft" },
  { icon: Sun, label: "太阳能组件装配", count: 286, templates: 12, color: "text-warning", bg: "bg-warning-soft" },
  { icon: ShieldCheck, label: "质量与合规", count: 324, templates: 14, color: "text-success", bg: "bg-success-soft" },
  { icon: Globe, label: "外贸与销售", count: 262, templates: 9, color: "text-info", bg: "bg-info-soft" },
];

export function QuestionBankGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {BANKS.map((b) => (
        <Card
          key={b.label}
          className="rounded-2xl p-5 cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:shadow-md group"
        >
          <div className={`h-10 w-10 rounded-xl ${b.bg} ${b.color} flex items-center justify-center mb-3`}>
            <b.icon className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold">{b.label}</h4>
          <p className="text-xs text-muted-foreground mt-1">{b.count} 题 · {b.templates} 试卷模板</p>
          <span className="text-xs text-train-offline opacity-0 group-hover:opacity-100 transition-opacity mt-2 block">进入题库 →</span>
        </Card>
      ))}
    </div>
  );
}
