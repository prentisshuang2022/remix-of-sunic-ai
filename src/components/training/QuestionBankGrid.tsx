import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ChevronRight, Zap, Sun, Shield, Globe } from "lucide-react";

const KB = [
  { key: "laser", icon: Zap, label: "激光设备操作", desc: "激光打标、雕刻、划片等设备操作 SOP 及安全规范", n1: 412, n2: 18, color: "purple" as const },
  { key: "solar", icon: Sun, label: "太阳能组件", desc: "组件装配 / 测试 / 串焊 / EL 检测等工艺流程", n1: 286, n2: 12, color: "orange" as const },
  { key: "qa", icon: Shield, label: "质量与合规", desc: "ISO9001 / 3A 认证 / 安全生产 / 消防应急", n1: 324, n2: 14, color: "green" as const },
  { key: "trade", icon: Globe, label: "外贸与销售", desc: "出口流程 / 产品知识 / 客户沟通话术 / 报价规则", n1: 262, n2: 9, color: "blue" as const },
];

const iconBg: Record<string, string> = {
  purple: "text-[hsl(239,84%,67%)] bg-[hsl(239,84%,67%)/0.1]",
  orange: "text-warning bg-warning/15",
  green: "text-success bg-success/15",
  blue: "text-info bg-info/10",
};

export function QuestionBankGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {KB.map((k) => {
        const Icon = k.icon;
        return (
          <Card
            key={k.key}
            className="p-4 rounded-2xl cursor-pointer hover:border-[hsl(239,84%,67%)]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group"
            onClick={() => navigate(`/training/question-bank?cat=${k.key}`)}
          >
            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-3", iconBg[k.color])}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-sm font-semibold mb-1 flex items-center justify-between">
              {k.label}
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed min-h-[34px]">{k.desc}</div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-dashed">
              <div>
                <div className="text-base font-semibold tabular-nums">{k.n1}</div>
                <div className="text-[10px] text-muted-foreground font-mono">题目</div>
              </div>
              <div className="text-right">
                <div className="text-base font-semibold tabular-nums">{k.n2}</div>
                <div className="text-[10px] text-muted-foreground font-mono">试卷模板</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
