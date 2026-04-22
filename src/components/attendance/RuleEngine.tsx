/**
 * Tab 4: 规则引擎
 * [BACKEND] 规则配置由后端 API 提供
 */
import { useState, useRef, useEffect } from "react";
import {
  Repeat2, Coffee, Moon, Briefcase, AlertTriangle,
  ChevronDown, Plus, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { attendanceRules, type AttendanceRule } from "@/mocks/attendance";
import AddRuleDrawer from "./AddRuleDrawer";

const iconMap: Record<string, React.ElementType> = {
  Repeat2, Coffee, Moon, Briefcase, AlertTriangle,
};

export default function RuleEngine() {
  const [rules, setRules] = useState(attendanceRules);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  };

  const handleRuleCreated = (rule: AttendanceRule) => {
    setRules((prev) => [rule, ...prev]);
    setHighlightId(rule.id);
    // Clear highlight after animation
    setTimeout(() => setHighlightId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 标题区 */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold">规则引擎配置</h2>
          <p className="mt-1 text-sm text-muted-foreground">将书面制度转化为可执行的自动化规则</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground" onClick={() => setDrawerOpen(true)}>
          <Plus className="h-4 w-4" />
          新增规则
        </Button>
      </div>

      {/* 提示条 */}
      <div className="flex items-start gap-2 rounded-lg border p-3 text-sm"
        style={{ backgroundColor: "hsl(var(--warning-soft))", borderColor: "hsl(var(--warning) / 0.4)" }}>
        <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "hsl(var(--warning))" }} />
        <span className="text-muted-foreground">
          以下规则均基于公司书面制度配置，系统自动执行计算。
          HR 仅需定期复核结果，无需逐人手工统计。规则变更后自动重算所有受影响员工数据。
        </span>
      </div>

      {/* 运行状态 */}
      <p className="text-xs text-muted-foreground">
        {rules.filter((r) => r.enabled).length} 条规则运行中
      </p>

      {/* 规则卡片列表 */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onToggle={toggleRule}
            highlight={rule.id === highlightId}
          />
        ))}
      </div>

      <AddRuleDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onRuleCreated={handleRuleCreated}
      />
    </div>
  );
}

function RuleCard({ rule, onToggle, highlight }: { rule: AttendanceRule; onToggle: (id: string) => void; highlight?: boolean }) {
  const Icon = iconMap[rule.icon] || Repeat2;

  return (
    <div className={cn(
      "flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all",
      highlight && "ring-2 ring-primary animate-pulse",
    )}>
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", rule.iconBg)}>
        <Icon className={cn("h-5 w-5", rule.iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge category={rule.category} />
          <span className="text-sm font-semibold">{rule.name}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{rule.description}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Switch checked={rule.enabled} onCheckedChange={() => onToggle(rule.id)} />
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function Badge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
      {category}
    </span>
  );
}
