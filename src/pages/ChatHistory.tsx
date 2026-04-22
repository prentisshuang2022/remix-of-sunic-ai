import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MessageSquarePlus, Pin, Star, Pencil, Trash2, Download,
  Send, MoreHorizontal, Sparkles, FileText, Briefcase, GraduationCap,
  Clock, BarChart3, Users, Filter, ChevronRight, MessagesSquare, Share2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Scene = "recruit" | "perf" | "train" | "attend" | "emp" | "data";

const SCENE_META: Record<Scene, { label: string; icon: typeof Briefcase; cls: string }> = {
  recruit: { label: "招聘官", icon: Briefcase, cls: "text-primary bg-primary/10 border-primary/30" },
  perf: { label: "绩效官", icon: BarChart3, cls: "text-[hsl(var(--ai))] bg-[hsl(var(--ai-soft))] border-[hsl(var(--ai))]/30" },
  train: { label: "培训官", icon: GraduationCap, cls: "text-success bg-success/15 border-success/30" },
  attend: { label: "考勤官", icon: Clock, cls: "text-warning bg-warning/15 border-warning/30" },
  emp: { label: "档案官", icon: Users, cls: "text-info bg-info/10 border-info/30" },
  data: { label: "数据官", icon: BarChart3, cls: "text-[hsl(var(--ai))] bg-[hsl(var(--ai-soft))] border-[hsl(var(--ai))]/30" },
};

interface Turn { role: "user" | "assistant"; text: string }
interface Conversation {
  id: string;
  title: string;
  scene: Scene;
  pinned: boolean;
  starred: boolean;
  msgs: number;
  participants: string[];
  updatedAt: string; // ISO
  preview: string;
  turns: Turn[];
  tags: string[];
}

const NOW = new Date();
const iso = (offsetH: number) => new Date(NOW.getTime() - offsetH * 3600 * 1000).toISOString();

const INITIAL: Conversation[] = [
  {
    id: "C-2031", title: "激光工艺工程师 · 简历筛选", scene: "recruit",
    pinned: true, starred: true, msgs: 12, participants: ["HRBP 周敏"],
    updatedAt: iso(2), preview: "已命中 8 位，Top 3 已加入候选池，待陈思雨面试反馈",
    tags: ["招聘", "激光"],
    turns: [
      { role: "user", text: "帮我筛选「激光工艺工程师」岗位的简历，重点看 5 年以上 + 划片机经验" },
      { role: "assistant", text: "已按筛选条件命中 8 位候选人，3 位与 JD 高度匹配（≥85%）。Top 1：陈思雨 · 8 年激光工艺 · 92% 匹配。" },
      { role: "user", text: "把 Top 3 都生成评估报告" },
      { role: "assistant", text: "已生成 3 份评估报告并发到你的钉钉，附岗位匹配雷达图与建议薪资区间。" },
    ],
  },
  {
    id: "C-2030", title: "本周考勤异常 · 组件车间夜班", scene: "attend",
    pinned: true, starred: false, msgs: 8, participants: ["考勤主管 张磊"],
    updatedAt: iso(5), preview: "夜班漏打卡 11 条已批量补卡，已通知车间主任",
    tags: ["考勤", "鄂州"],
    turns: [
      { role: "user", text: "本周考勤异常都集中在哪些部门？" },
      { role: "assistant", text: "27 条 · 组件车间 11 / 外贸组 8 / 研发中心 4。组件车间集中在夜班漏打卡。" },
      { role: "user", text: "生成补卡审批流给车间主任" },
      { role: "assistant", text: "已生成批量补卡审批，覆盖 11 条记录，待车间主任审批。" },
    ],
  },
  {
    id: "C-2029", title: "激光划片机安全复训 · AI 出卷", scene: "train",
    pinned: false, starred: true, msgs: 6, participants: [],
    updatedAt: iso(20), preview: "40 题草案已发布到钉钉，应考 32 人",
    tags: ["培训", "出卷"],
    turns: [
      { role: "user", text: "为激光划片机出一套 40 题安全复训试卷，覆盖黄龙山和鄂州" },
      { role: "assistant", text: "已生成草案：单选 24 / 多选 10 / 判断 6，难度中，建议通过线 70 分。" },
      { role: "user", text: "发布到钉钉" },
      { role: "assistant", text: "已发布，钉钉群 32 人收到通知，截止 11-20 18:00。" },
    ],
  },
  {
    id: "C-2028", title: "Q3 营销中心 KPI 复盘", scene: "perf",
    pinned: false, starred: false, msgs: 14, participants: ["营销总监 王强"],
    updatedAt: iso(28), preview: "营收达成 92%，新客增长不足，建议 Q4 重点关注",
    tags: ["绩效", "营销"],
    turns: [
      { role: "user", text: "本季度营销中心的 KPI 完成情况，列出 Top 3 风险" },
      { role: "assistant", text: "Top 1 风险：新客增长 67% → 建议加大外贸引流；Top 2：客户复购 81%；Top 3：人效 88%。" },
    ],
  },
  {
    id: "C-2027", title: "新员工王小明 · 在岗培训进展", scene: "train",
    pinned: false, starred: false, msgs: 5, participants: [],
    updatedAt: iso(32), preview: "W4 中期评估待导师提交，已差 2 天",
    tags: ["培训", "新员工"], turns: [
      { role: "user", text: "新员工王小明本周在岗培训进展如何？" },
      { role: "assistant", text: "节点 W4 · 中期评估，进度 50%，导师 李建华 记录待提交（差 2 天），已自动催办。" },
    ],
  },
  {
    id: "C-2026", title: "11 月人事周报", scene: "data",
    pinned: false, starred: false, msgs: 3, participants: [],
    updatedAt: iso(50), preview: "已生成 PDF 周报，含招聘漏斗、培训完成率、考勤异常",
    tags: ["数据", "周报"], turns: [
      { role: "user", text: "生成一份 11 月人事周报（招聘 / 培训 / 考勤）" },
      { role: "assistant", text: "已生成 PDF 周报：招聘漏斗、培训完成率 87%、考勤异常 27 条。可点击下载。" },
    ],
  },
  {
    id: "C-2025", title: "供应链 / 仓储组员工分布", scene: "emp",
    pinned: false, starred: false, msgs: 4, participants: [],
    updatedAt: iso(74), preview: "在岗 18 人，鄂州 12 / 黄龙山 6，平均司龄 3.4 年",
    tags: ["档案"], turns: [
      { role: "user", text: "供应链 / 仓储组在岗员工分布" },
      { role: "assistant", text: "在岗 18 人 · 鄂州 12 / 黄龙山 6 · 平均司龄 3.4 年 · 本月转正 1 人。" },
    ],
  },
  {
    id: "C-2024", title: "外贸业务员岗前培训 · 自动判分", scene: "train",
    pinned: false, starred: false, msgs: 7, participants: ["外贸主管 Sophie"],
    updatedAt: iso(120), preview: "5 人参考，平均 84.2 分，已写入档案",
    tags: ["培训", "外贸"], turns: [
      { role: "user", text: "外贸业务员岗前培训考试自动判分了吗？" },
      { role: "assistant", text: "5 人参考，自动判分完成，平均 84.2，已写入员工培训档案。" },
    ],
  },
  {
    id: "C-2023", title: "对比黄龙山和鄂州关键人事指标", scene: "data",
    pinned: false, starred: false, msgs: 9, participants: [],
    updatedAt: iso(180), preview: "黄龙山节点达成率领先 4.2pct，鄂州人效更高",
    tags: ["数据", "跨基地"], turns: [
      { role: "user", text: "对比黄龙山和鄂州两个基地的关键人事指标" },
      { role: "assistant", text: "黄龙山节点达成率领先 4.2pct；鄂州人效更高 8.1%；离职率两地接近。" },
    ],
  },
];

function groupByTime(items: Conversation[]) {
  const groups: Record<string, Conversation[]> = { 今天: [], 昨天: [], 本周: [], 更早: [] };
  const now = NOW.getTime();
  for (const c of items) {
    const diffH = (now - new Date(c.updatedAt).getTime()) / 3600000;
    if (diffH < 24) groups["今天"].push(c);
    else if (diffH < 48) groups["昨天"].push(c);
    else if (diffH < 24 * 7) groups["本周"].push(c);
    else groups["更早"].push(c);
  }
  return groups;
}

function relTime(iso: string) {
  const diffH = (NOW.getTime() - new Date(iso).getTime()) / 3600000;
  if (diffH < 1) return `${Math.max(1, Math.floor(diffH * 60))} 分钟前`;
  if (diffH < 24) return `${Math.floor(diffH)} 小时前`;
  if (diffH < 24 * 7) return `${Math.floor(diffH / 24)} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

export default function ChatHistory() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Conversation[]>(INITIAL);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "pinned" | "starred" | Scene>("all");
  const [selectedId, setSelectedId] = useState<string>(INITIAL[0].id);
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);
  const [renameText, setRenameText] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [followup, setFollowup] = useState("");

  const filtered = useMemo(() => {
    return items
      .filter((c) => {
        if (tab === "pinned" && !c.pinned) return false;
        if (tab === "starred" && !c.starred) return false;
        if (tab !== "all" && tab !== "pinned" && tab !== "starred" && c.scene !== tab) return false;
        if (q && !c.title.includes(q) && !c.preview.includes(q) && !c.tags.some((t) => t.includes(q))) return false;
        return true;
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [items, q, tab]);

  const grouped = useMemo(() => groupByTime(filtered), [filtered]);
  const selected = items.find((c) => c.id === selectedId) ?? filtered[0];

  const togglePin = (id: string) => {
    setItems((arr) => arr.map((c) => c.id === id ? { ...c, pinned: !c.pinned } : c));
    const c = items.find((x) => x.id === id);
    toast.success(c?.pinned ? "已取消置顶" : "已置顶");
  };
  const toggleStar = (id: string) => {
    setItems((arr) => arr.map((c) => c.id === id ? { ...c, starred: !c.starred } : c));
  };
  const doRename = () => {
    if (!renameTarget || !renameText.trim()) return;
    setItems((arr) => arr.map((c) => c.id === renameTarget.id ? { ...c, title: renameText.trim() } : c));
    toast.success("已重命名");
    setRenameTarget(null);
  };
  const doDelete = () => {
    if (!deleteTarget) return;
    setItems((arr) => arr.filter((c) => c.id !== deleteTarget.id));
    if (selectedId === deleteTarget.id) setSelectedId(items.find((c) => c.id !== deleteTarget.id)?.id ?? "");
    toast.success(`已删除「${deleteTarget.title}」`);
    setDeleteTarget(null);
  };
  const doExport = (c: Conversation, fmt: "md" | "pdf") => {
    toast.success(`已导出「${c.title}」为 ${fmt === "md" ? "Markdown" : "PDF"} 纪要`);
  };
  const sendFollowup = () => {
    const v = followup.trim();
    if (!v || !selected) return;
    setItems((arr) => arr.map((c) => c.id === selected.id ? {
      ...c,
      msgs: c.msgs + 2,
      updatedAt: new Date().toISOString(),
      preview: v.length > 28 ? v.slice(0, 28) + "..." : v,
      turns: [
        ...c.turns,
        { role: "user", text: v },
        { role: "assistant", text: "（演示）已收到追问，正在调用对应工具…完整生成请到「新建对话」继续。" },
      ],
    } : c));
    setFollowup("");
    toast.success("已在原会话基础上追问");
  };

  const sceneTabs: { key: typeof tab; label: string }[] = [
    { key: "all", label: `全部 ${items.length}` },
    { key: "pinned", label: `置顶 ${items.filter((c) => c.pinned).length}` },
    { key: "starred", label: `收藏 ${items.filter((c) => c.starred).length}` },
    { key: "recruit", label: "招聘" },
    { key: "perf", label: "绩效" },
    { key: "train", label: "培训" },
    { key: "attend", label: "考勤" },
  ];

  return (
    <>
      <PageHeader
        title="历史对话"
        description="按时间检索过往会话 · 继续追问 · 一键导出纪要"
        actions={
          <Button size="sm" onClick={() => navigate("/chat/new")}>
            <MessageSquarePlus className="h-4 w-4 mr-1.5" />新建对话
          </Button>
        }
      />

      <div className="grid grid-cols-[340px_1fr] h-[calc(100vh-var(--header-h,8rem))] min-h-[600px]">
        {/* 左：列表 */}
        <aside className="border-r flex flex-col bg-muted/20 min-h-0">
          <div className="p-3 border-b space-y-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索标题 / 摘要 / 标签" className="pl-8 h-8 text-sm" />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 -mx-1 px-1">
              {sceneTabs.map((t) => (
                <Badge
                  key={String(t.key)}
                  variant="outline"
                  className={cn("cursor-pointer text-[10px] font-normal whitespace-nowrap shrink-0",
                    tab === t.key ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/40")}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {Object.entries(grouped).map(([g, list]) =>
              list.length === 0 ? null : (
                <div key={g}>
                  <div className="px-3 pt-3 pb-1 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">{g} · {list.length}</div>
                  {list.map((c) => (
                    <ConvItem
                      key={c.id}
                      conv={c}
                      active={c.id === selectedId}
                      onClick={() => setSelectedId(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                      onToggleStar={() => toggleStar(c.id)}
                      onRename={() => { setRenameTarget(c); setRenameText(c.title); }}
                      onDelete={() => setDeleteTarget(c)}
                      onExport={(f) => doExport(c, f)}
                    />
                  ))}
                </div>
              )
            )}
            {filtered.length === 0 && (
              <div className="p-10 text-center text-xs text-muted-foreground">没有匹配的会话</div>
            )}
          </div>
        </aside>

        {/* 右：详情预览 */}
        <main className="flex flex-col min-w-0 bg-background min-h-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">从左侧选择一个会话</div>
          ) : (
            <>
              <div className="border-b px-6 py-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <SceneBadge scene={selected.scene} />
                    {selected.pinned && <Pin className="h-3.5 w-3.5 text-warning fill-warning" />}
                    {selected.starred && <Star className="h-3.5 w-3.5 text-warning fill-warning" />}
                    <span className="font-mono text-[10px] text-muted-foreground">{selected.id}</span>
                  </div>
                  <h2 className="text-lg font-semibold mt-1 truncate">{selected.title}</h2>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{relTime(selected.updatedAt)}</span>
                    <span className="text-border">·</span>
                    <span>{selected.msgs} 条消息</span>
                    {selected.participants.length > 0 && <>
                      <span className="text-border">·</span>
                      <span>共 {selected.participants.join("、")}</span>
                    </>}
                    {selected.tags.length > 0 && <>
                      <span className="text-border">·</span>
                      <span className="flex gap-1">
                        {selected.tags.map((t) => <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">#{t}</span>)}
                      </span>
                    </>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => togglePin(selected.id)}>
                    <Pin className={cn("h-3.5 w-3.5 mr-1", selected.pinned && "fill-warning text-warning")} />{selected.pinned ? "取消置顶" : "置顶"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        <Download className="h-3.5 w-3.5 mr-1" />导出
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => doExport(selected, "md")}>
                        <FileText className="h-3.5 w-3.5 mr-2" />导出为 Markdown 纪要
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => doExport(selected, "pdf")}>
                        <FileText className="h-3.5 w-3.5 mr-2" />导出为 PDF 纪要
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toast.success("已抄送到 #人事-AI 钉钉群")}>
                        <Share2 className="h-3.5 w-3.5 mr-2" />抄送到钉钉群
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleStar(selected.id)}>
                        <Star className={cn("h-3.5 w-3.5 mr-2", selected.starred && "fill-warning text-warning")} />
                        {selected.starred ? "取消收藏" : "收藏"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setRenameTarget(selected); setRenameText(selected.title); }}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />重命名
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteTarget(selected)} className="text-destructive">
                        <Trash2 className="h-3.5 w-3.5 mr-2" />删除会话
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* 对话气泡预览 */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {selected.turns.map((t, i) => (
                  <div key={i} className={cn("flex gap-3 max-w-3xl", t.role === "user" ? "ml-auto justify-end" : "")}>
                    {t.role === "assistant" && (
                      <Avatar className="h-7 w-7"><AvatarFallback className="bg-[hsl(var(--ai-soft))] text-[hsl(var(--ai))]"><Sparkles className="h-3.5 w-3.5" /></AvatarFallback></Avatar>
                    )}
                    <div className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[75%] whitespace-pre-wrap",
                      t.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                    )}>
                      {t.text}
                    </div>
                    {t.role === "user" && (
                      <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-muted">我</AvatarFallback></Avatar>
                    )}
                  </div>
                ))}
              </div>

              {/* 继续追问 */}
              <div className="border-t bg-muted/20 p-4">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-1.5 mb-2 text-[11px] text-muted-foreground">
                    <MessagesSquare className="h-3 w-3" />
                    在原会话基础上继续追问，上下文将自动带入
                  </div>
                  <div className="flex items-center gap-2 bg-background border rounded-xl pl-3 pr-1.5 py-1.5 focus-within:border-primary transition-colors">
                    <Input
                      value={followup}
                      onChange={(e) => setFollowup(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") sendFollowup(); }}
                      placeholder="继续追问，例如：把结论同步给主管"
                      className="border-0 h-7 text-sm focus-visible:ring-0 px-0"
                    />
                    <Button size="sm" className="h-7 w-7 p-0" disabled={!followup.trim()} onClick={sendFollowup}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {["把结论同步给主管", "再细化一层", "导出为纪要"].map((q) => (
                        <button
                          key={q}
                          onClick={() => { setFollowup(q); }}
                          className="text-[10px] border border-dashed rounded-full px-2 py-0.5 hover:border-primary/50 hover:bg-primary/5"
                        >+ {q}</button>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate("/chat/new")}
                      className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
                    >
                      在新窗口打开完整对话 <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* 重命名对话框 */}
      <Dialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>重命名会话</DialogTitle></DialogHeader>
          <Input value={renameText} onChange={(e) => setRenameText(e.target.value)} autoFocus />
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setRenameTarget(null)}>取消</Button>
            <Button size="sm" onClick={doRename}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除会话？</AlertDialogTitle>
            <AlertDialogDescription>
              将永久删除「{deleteTarget?.title}」及其全部消息，操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ConvItem({
  conv, active, onClick, onTogglePin, onToggleStar, onRename, onDelete, onExport,
}: {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
  onTogglePin: () => void;
  onToggleStar: () => void;
  onRename: () => void;
  onDelete: () => void;
  onExport: (f: "md" | "pdf") => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group px-3 py-2.5 border-l-2 cursor-pointer transition-colors",
        active ? "bg-background border-l-primary" : "border-l-transparent hover:bg-background/60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <SceneBadge scene={conv.scene} small />
            {conv.pinned && <Pin className="h-2.5 w-2.5 text-warning fill-warning shrink-0" />}
            {conv.starred && <Star className="h-2.5 w-2.5 text-warning fill-warning shrink-0" />}
          </div>
          <div className="text-sm font-medium truncate">{conv.title}</div>
          <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{conv.preview}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] text-muted-foreground font-mono">{relTime(conv.updatedAt)}</div>
          <div className="text-[10px] text-muted-foreground font-mono">{conv.msgs} msg</div>
        </div>
      </div>
      <div className="flex items-center gap-0.5 mt-1 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="置顶" onClick={onTogglePin}>
          <Pin className={cn("h-3 w-3", conv.pinned && "fill-warning text-warning")} />
        </Button>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="收藏" onClick={onToggleStar}>
          <Star className={cn("h-3 w-3", conv.starred && "fill-warning text-warning")} />
        </Button>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="重命名" onClick={onRename}>
          <Pencil className="h-3 w-3" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="更多">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onExport("md")}><Download className="h-3.5 w-3.5 mr-2" />导出 Markdown</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("pdf")}><Download className="h-3.5 w-3.5 mr-2" />导出 PDF</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-3.5 w-3.5 mr-2" />删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function SceneBadge({ scene, small }: { scene: Scene; small?: boolean }) {
  const m = SCENE_META[scene];
  const Icon = m.icon;
  return (
    <Badge variant="outline" className={cn("font-normal gap-1", m.cls, small ? "text-[9px] py-0 px-1.5 h-4" : "text-[10px]")}>
      <Icon className={small ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {m.label}
    </Badge>
  );
}
