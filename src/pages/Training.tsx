import { TrainingProvider, useTraining, type Role, type HRTab } from "@/components/training/TrainingContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HRDashboard from "@/components/training/hr/HRDashboard";
import TrainingTasks from "@/components/training/hr/TrainingTasks";
import TaskDetail from "@/components/training/hr/TaskDetail";
import MaterialBank from "@/components/training/hr/MaterialBank";
import EmployeeData from "@/components/training/hr/EmployeeData";
import EmployeeView from "@/components/training/employee/EmployeeView";

const tabTriggerClass =
  "gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-1 text-sm data-[state=active]:border-[#1E6FFF] data-[state=active]:bg-transparent data-[state=active]:text-[#1E6FFF] data-[state=active]:font-semibold data-[state=active]:shadow-none";

function TrainingInner() {
  const { role, setRole, hrTab, setHRTab, selectedTaskId } = useTraining();

  const handleTabChange = (v: string) => setHRTab(v as HRTab);

  const activeHRTab = selectedTaskId ? "tasks" : hrTab;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b px-6 pt-6 pb-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold">培训助手</h1>
            <p className="mt-1 text-sm text-muted-foreground">轻量培训管理 — HR 派任务 · 员工 Web 端学习考试 · 结果自动回流</p>
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
          <Tabs value={activeHRTab} onValueChange={handleTabChange} className="mt-4">
            <TabsList className="h-auto bg-transparent p-0 w-full justify-start rounded-none gap-2">
              <TabsTrigger value="dashboard" className={tabTriggerClass}>工作台</TabsTrigger>
              <TabsTrigger value="tasks" className={tabTriggerClass}>培训任务</TabsTrigger>
              <TabsTrigger value="materials" className={tabTriggerClass}>培训素材</TabsTrigger>
              <TabsTrigger value="employees" className={tabTriggerClass}>员工与数据</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Content */}
      {role === "hr" ? (
        <div className="p-6">
          {selectedTaskId ? (
            <TaskDetail />
          ) : (
            <>
              {hrTab === "dashboard" && <HRDashboard />}
              {hrTab === "tasks" && <TrainingTasks />}
              {hrTab === "materials" && <MaterialBank />}
              {hrTab === "employees" && <EmployeeData />}
            </>
          )}
        </div>
      ) : (
        <EmployeeView />
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
