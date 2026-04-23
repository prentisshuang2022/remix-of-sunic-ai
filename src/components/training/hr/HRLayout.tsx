import { LayoutDashboard, BookOpen, Library, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTraining, type HRPage } from "../TrainingContext";
import HRDashboard from "./HRDashboard";
import TrainingTasks from "./TrainingTasks";
import TaskDetail from "./TaskDetail";
import CoursewareBank from "./CoursewareBank";
import EmployeeData from "./EmployeeData";

const nav: { key: HRPage; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "工作台", icon: LayoutDashboard },
  { key: "tasks", label: "培训任务", icon: BookOpen },
  { key: "courseware", label: "题库与课件", icon: Library },
  { key: "employees", label: "员工与数据", icon: Users },
];

export default function HRLayout() {
  const { hrPage, setHRPage } = useTraining();
  const activeKey = hrPage === "taskDetail" ? "tasks" : hrPage;

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 border-r bg-card flex flex-col">
        <div className="p-5 border-b">
          <h2 className="text-base font-bold text-sg-blue">三工光电</h2>
          <p className="text-xs text-muted-foreground mt-0.5">培训助手 · HR 管理端</p>
        </div>
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {nav.map(n => (
            <button
              key={n.key}
              onClick={() => setHRPage(n.key)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                activeKey === n.key
                  ? "bg-sg-blue-soft text-sg-blue font-medium border-l-[3px] border-sg-blue"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
              {n.key === "tasks" && (
                <span className="ml-auto text-[10px] bg-sg-blue text-sg-blue-foreground rounded-full px-1.5 py-0.5">⭐</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-background p-6">
        {hrPage === "dashboard" && <HRDashboard />}
        {hrPage === "tasks" && <TrainingTasks />}
        {hrPage === "taskDetail" && <TaskDetail />}
        {hrPage === "courseware" && <CoursewareBank />}
        {hrPage === "employees" && <EmployeeData />}
      </main>
    </div>
  );
}
