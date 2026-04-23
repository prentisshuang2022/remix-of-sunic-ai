import { useTraining } from "../TrainingContext";
import EmployeeTaskList from "./EmployeeTaskList";
import EmployeeLearning from "./EmployeeLearning";
import EmployeeExam from "./EmployeeExam";
import EmployeeExamResult from "./EmployeeExamResult";
import EmployeeErrorReview from "./EmployeeErrorReview";
import EmployeeArchive from "./EmployeeArchive";
import { employees } from "../training-store";
import { Button } from "@/components/ui/button";

export default function EmployeeView() {
  const { empView, setEmpView, setRole, currentEmpId } = useTraining();
  const emp = employees.find(e => e.id === currentEmpId)!;

  if (empView === "learning") return <EmployeeLearning />;
  if (empView === "exam") return <EmployeeExam />;
  if (empView === "examResult") return <EmployeeExamResult />;
  if (empView === "errorReview") return <EmployeeErrorReview />;

  return (
    <div className="flex flex-col">
      <div className="border-b px-6 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1E6FFF] text-white flex items-center justify-center text-sm font-bold">{emp.avatar}</div>
          <div>
            <p className="text-sm font-medium">{emp.name} <span className="text-xs text-muted-foreground">{emp.empNo}</span></p>
            <p className="text-xs text-muted-foreground">{emp.dept} · {emp.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <Button size="sm" variant={empView === "taskList" ? "default" : "ghost"} className={empView === "taskList" ? "bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg h-8 text-xs" : "rounded-lg h-8 text-xs"} onClick={() => setEmpView("taskList")}>我的任务</Button>
            <Button size="sm" variant={empView === "archive" ? "default" : "ghost"} className={empView === "archive" ? "bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg h-8 text-xs" : "rounded-lg h-8 text-xs"} onClick={() => setEmpView("archive")}>我的档案</Button>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={() => setRole("hr")}>切回 HR</Button>
        </div>
      </div>
      <div className="p-6">
        {(empView === "taskList" || empView === "taskDetail") && <EmployeeTaskList />}
        {empView === "archive" && <EmployeeArchive />}
      </div>
    </div>
  );
}
