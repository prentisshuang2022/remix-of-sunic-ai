import { cn } from "@/lib/utils";
import { useTraining, type EmpTab } from "../TrainingContext";
import { Home, BookOpen, User } from "lucide-react";
import EmployeeHome from "./EmployeeHome";
import MyTraining from "./MyTraining";
import ProfilePage from "./ProfilePage";
import ExamPage from "./ExamPage";
import ExamResult from "./ExamResult";
import LearningPage from "./LearningPage";

const tabs: { key: EmpTab; label: string; icon: typeof Home }[] = [
  { key: "home", label: "首页", icon: Home },
  { key: "training", label: "我的培训", icon: BookOpen },
  { key: "profile", label: "我的", icon: User },
];

export default function EmployeeApp() {
  const { empTab, setEmpTab, empExamActive, empExamResult, empLearning } = useTraining();

  // Fullscreen states
  if (empExamActive) return <ExamPage />;
  if (empExamResult) return <ExamResult />;
  if (empLearning) return <LearningPage />;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {empTab === "home" && <EmployeeHome />}
        {empTab === "training" && <MyTraining />}
        {empTab === "profile" && <ProfilePage />}
      </div>

      {/* Tab bar */}
      <div className="shrink-0 border-t bg-card flex">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setEmpTab(t.key)}
            className={cn(
              "flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] transition-colors",
              empTab === t.key ? "text-sg-blue" : "text-muted-foreground"
            )}
          >
            <t.icon className="h-5 w-5" />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
