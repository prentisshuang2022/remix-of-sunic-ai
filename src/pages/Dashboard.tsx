import { Link } from "react-router-dom";
import {
  CalendarClock,
  UserSquare2,
  Briefcase,
  LineChart,
  GraduationCap,
  Repeat2,
  ClipboardCheck,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "今日待处理异常", value: "12", icon: AlertTriangle, tone: "warning" },
  { label: "招聘中岗位", value: "8", icon: Briefcase, tone: "info" },
  { label: "本月已入职", value: "3", icon: CheckCircle2, tone: "success" },
  { label: "Q1 绩效完成率", value: "77%", icon: LineChart, tone: "primary" },
] as const;

const toneClass: Record<(typeof stats)[number]["tone"], string> = {
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  primary: "bg-primary-soft text-primary",
};

const modules = [
  { title: "员工档案助手", desc: "档案识别、合同到期、钉钉同步", url: "/employees", icon: UserSquare2 },
  { title: "考勤助手", desc: "异常核验、调休冲抵、月度复核闭环", url: "/attendance", icon: CalendarClock },
  { title: "招聘助手", desc: "需求池、画像生成、候选人推荐", url: "/recruiting", icon: Briefcase },
  { title: "绩效助手", desc: "表单收集、AI 校验、汇总分析", url: "/performance", icon: LineChart },
  { title: "培训助手", desc: "考试中心、AI 阅卷、补考闭环", url: "/training", icon: GraduationCap },
];

const todos = [
  { tag: "考勤", text: "李明 04-18 迟到 35 分钟，AI 建议补卡", time: "10:15", to: "/attendance/exception/1", tone: "warning" as const },
  { tag: "招聘", text: "财务主管岗位待指派 HR", time: "09:42", to: "/recruiting", tone: "info" as const },
  { tag: "绩效", text: "赵六 校验异常：总分 ≠ 各项加和", time: "昨日", to: "/performance", tone: "danger" as const },
  { tag: "调休", text: "张伟 余额 -8h，超支无加班证据", time: "昨日", to: "/attendance", tone: "warning" as const },
];

const todoTone: Record<"warning" | "info" | "danger", string> = {
  warning: "bg-warning-soft text-warning border-warning/30",
  info: "bg-info-soft text-info border-info/30",
  danger: "bg-danger-soft text-danger border-danger/30",
};

export default function Dashboard() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="工作台"
        description="人事 AI 员工 · 一站式 HR 智能协同"
      />

      <div className="space-y-6 p-6">
        {/* 统计 */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass[s.tone]}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-semibold tabular-nums">{s.value}</div>
                <div className="text-xs text-muted-foreground truncate">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 模块入口 */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">助手能力</CardTitle>
              <Badge variant="secondary" className="font-normal">{modules.length} 个模块</Badge>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {modules.map((m) => (
                <Link
                  key={m.url}
                  to={m.url}
                  className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <m.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{m.title}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{m.desc}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* 待办 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">今日待办</CardTitle>
              <Badge variant="secondary" className="font-normal">{todos.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {todos.map((t, i) => (
                <Link
                  key={i}
                  to={t.to}
                  className="block rounded-lg border bg-card p-3 transition-colors hover:bg-accent/40"
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${todoTone[t.tone]}`}>
                      {t.tag}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {t.time}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-snug">{t.text}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI 提醒 */}
        <div className="ai-card flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ai text-ai-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">AI 今日洞察</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              本月共 4 起调休冲突待处理；销售部 Q1 绩效环比下降 8.2 分，建议重点关注；3 名员工合同将在 30 天内到期。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
