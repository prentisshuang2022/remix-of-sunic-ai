import {
  LayoutDashboard,
  CalendarClock,
  UserSquare2,
  Briefcase,
  LineChart,
  GraduationCap,
  Repeat2,
  ClipboardCheck,
  MessageSquarePlus,
  History,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import logoUrl from "@/assets/logo.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const helpers = [
  { title: "工作台", url: "/", icon: LayoutDashboard },
  { title: "员工档案助手", url: "/employees", icon: UserSquare2 },
  { title: "考勤助手", url: "/attendance", icon: CalendarClock },
  { title: "招聘助手", url: "/recruiting", icon: Briefcase },
  { title: "绩效助手", url: "/performance", icon: LineChart },
  { title: "培训助手", url: "/training", icon: GraduationCap },
];

const conversation = [
  { title: "新建对话", url: "/chat/new", icon: MessageSquarePlus },
  { title: "历史对话", url: "/chat/history", icon: History },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  const renderItem = (item: { title: string; url: string; icon: typeof LayoutDashboard }) => {
    const active =
      item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
    return (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton asChild tooltip={item.title}>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            className={cn(
              "group/menu flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-white">
            <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">人事 AI 员工</span>
              <span className="text-[11px] text-muted-foreground">HR Copilot</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>助手</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{helpers.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>对话</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{conversation.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
