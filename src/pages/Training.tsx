import { TrainingProvider, useTraining, type Role } from "@/components/training/TrainingContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HRLayout from "@/components/training/hr/HRLayout";
import EmployeeApp from "@/components/training/employee/EmployeeApp";

function TrainingInner() {
  const { role, setRole } = useTraining();

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Top bar with role switcher */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b bg-card">
        <div>
          <h1 className="text-lg font-bold">三工光电 · 培训助手</h1>
          <p className="text-xs text-muted-foreground">轻量培训管理 — HR 派任务 · 员工手机学习考试 · 结果自动回流</p>
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

      {/* Content */}
      <div className="flex-1 min-h-0">
        {role === "hr" ? (
          <HRLayout />
        ) : (
          /* iPhone frame centered */
          <div className="h-full flex items-start justify-center py-6 bg-muted/30 overflow-y-auto">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[375px] h-[720px] rounded-[40px] border-[6px] border-foreground/80 bg-card shadow-2xl overflow-hidden flex flex-col">
                {/* Status bar */}
                <div className="shrink-0 h-11 bg-card flex items-center justify-between px-6 text-[10px]">
                  <span className="font-medium">9:41</span>
                  <div className="w-20 h-5 rounded-full bg-foreground/80 mx-auto" />
                  <div className="flex gap-1">
                    <span>📶</span><span>🔋</span>
                  </div>
                </div>
                {/* App content */}
                <div className="flex-1 min-h-0">
                  <EmployeeApp />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
