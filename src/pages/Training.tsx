import { useState } from "react";
import { TrainingProvider, useTraining, type Role } from "@/components/training/TrainingContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HRDashboard from "@/components/training/hr/HRDashboard";
import TrainingTasks from "@/components/training/hr/TrainingTasks";
import TaskDetail from "@/components/training/hr/TaskDetail";
import CoursewareBank from "@/components/training/hr/CoursewareBank";
import EmployeeData from "@/components/training/hr/EmployeeData";
import EmployeeApp from "@/components/training/employee/EmployeeApp";

const tabTriggerClass =
  "gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-1 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none";

type HRTab = "dashboard" | "tasks" | "courseware" | "employees";

function TrainingInner() {
  const { role, setRole, hrPage, setHRPage } = useTraining();
  const [tab, setTab] = useState<HRTab>("dashboard");

  const handleTabChange = (v: string) => {
    const t = v as HRTab;
    setTab(t);
    setHRPage(t);
  };

  // Sync tab highlight when viewing task detail
  const activeTab = hrPage === "taskDetail" ? "tasks" : (["dashboard", "tasks", "courseware", "employees"].includes(hrPage) ? hrPage : tab);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b px-6 pt-6 pb-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold">培训助手</h1>
            <p className="mt-1 text-sm text-muted-foreground">轻量培训管理 — HR 派任务 · 员工手机学习考试 · 结果自动回流</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">角色切换</span>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="w-[140px] rounded-lg h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hr">👩‍💼 HR 管理员</SelectItem>
                <SelectItem value="employee">👷 一线员工</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {role === "hr" && (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
            <TabsList className="h-auto bg-transparent p-0 w-full justify-start rounded-none gap-2">
              <TabsTrigger value="dashboard" className={tabTriggerClass}>工作台</TabsTrigger>
              <TabsTrigger value="tasks" className={tabTriggerClass}>培训任务</TabsTrigger>
              <TabsTrigger value="courseware" className={tabTriggerClass}>题库与课件</TabsTrigger>
              <TabsTrigger value="employees" className={tabTriggerClass}>员工与数据</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Content */}
      {role === "hr" ? (
        <div className="p-6">
          {hrPage === "dashboard" && <HRDashboard />}
          {hrPage === "tasks" && <TrainingTasks />}
          {hrPage === "taskDetail" && <TaskDetail />}
          {hrPage === "courseware" && <CoursewareBank />}
          {hrPage === "employees" && <EmployeeData />}
        </div>
      ) : (
        <div className="h-[calc(100vh-8rem)] flex items-start justify-center py-6 bg-muted/30 overflow-y-auto">
          <div className="relative">
            <div className="w-[375px] h-[720px] rounded-[40px] border-[6px] border-foreground/80 bg-card shadow-2xl overflow-hidden flex flex-col">
              <div className="shrink-0 h-11 bg-card flex items-center justify-between px-6 text-[10px]">
                <span className="font-medium">9:41</span>
                <div className="w-20 h-5 rounded-full bg-foreground/80 mx-auto" />
                <div className="flex gap-1">
                  <span>📶</span><span>🔋</span>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <EmployeeApp />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Training() {
  return (
    <TrainingProvider>
      <TrainingInner />
    </TrainingProvider>
  );
}
