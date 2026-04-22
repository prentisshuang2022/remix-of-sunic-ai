/**
 * 考勤助手 — 一级菜单页面
 * 包含 4 个子 Tab：今日概览 / 考勤明细 / 加班调休 / 规则引擎
 */
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TodayOverview from "@/components/attendance/TodayOverview";
import AttendanceHeatmap from "@/components/attendance/AttendanceHeatmap";
import OvertimeLeave from "@/components/attendance/OvertimeLeave";
import RuleEngine from "@/components/attendance/RuleEngine";

const tabTriggerClass =
  "gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-1 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none";

export default function Attendance() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="flex flex-col">
      {/* 页面标题 */}
      <div className="border-b px-6 pt-6 pb-0">
        <h1 className="text-xl font-semibold">考勤助手</h1>
        <p className="mt-1 text-sm text-muted-foreground">考勤数据智能核算与异常处理中心</p>

        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="h-auto bg-transparent p-0 w-full justify-start rounded-none gap-2">
            <TabsTrigger value="overview" className={tabTriggerClass}>今日概览</TabsTrigger>
            <TabsTrigger value="detail" className={tabTriggerClass}>考勤明细</TabsTrigger>
            <TabsTrigger value="overtime" className={tabTriggerClass}>加班调休</TabsTrigger>
            <TabsTrigger value="rules" className={tabTriggerClass}>规则引擎</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab 内容 */}
      <div className="p-6">
        {tab === "overview" && <TodayOverview onSwitchTab={setTab} />}
        {tab === "detail" && <AttendanceHeatmap />}
        {tab === "overtime" && <OvertimeLeave />}
        {tab === "rules" && <RuleEngine />}
      </div>
    </div>
  );
}
