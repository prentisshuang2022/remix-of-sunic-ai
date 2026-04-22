import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  ClipboardCheck,
  Archive,
  Users,
  FileBarChart,
  Settings,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MENU = [
  { label: "总览", icon: LayoutDashboard, path: "/training" },
  { label: "题库管理", icon: Database, path: "/training/question-bank" },
  { label: "考试中心", icon: ClipboardCheck, path: "/training/offsite" },
  { label: "成绩留档", icon: Archive, path: "/training/materials" },
  { label: "在岗培训", icon: Users, path: "/training/onsite" },
  { label: "记录汇总", icon: FileBarChart, path: "/training/mentors" },
  { label: "系统设置", icon: Settings, path: "/training/settings" },
];

export function TrainingSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    path === "/training" ? pathname === "/training" : pathname.startsWith(path);

  return (
    <aside className="hidden lg:flex flex-col w-[220px] shrink-0 border-r bg-card h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(239,84%,67%)] to-[hsl(160,59%,46%)] flex items-center justify-center">
            <GraduationCap className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight truncate">三工光电</div>
            <div className="text-[10px] text-muted-foreground leading-tight">培训 AI 助手</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {MENU.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors relative",
                active
                  ? "bg-[hsl(239,84%,67%)/0.08] text-[hsl(239,84%,67%)] font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-sm bg-[hsl(239,84%,67%)]" />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t">
        <div className="text-[10px] text-muted-foreground">
          武汉三工光电设备制造有限公司
        </div>
      </div>
    </aside>
  );
}
