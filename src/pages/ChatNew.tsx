import { useState, useEffect, useRef } from "react";
import {
  Sparkles, Send, Paperclip, Mic, ArrowUp, Users, ClipboardCheck,
  GraduationCap, Clock, BarChart3, Briefcase, FileText, ChevronRight,
  ChevronDown, Brain, ExternalLink, ThumbsUp, ThumbsDown, RotateCcw,
  Copy, Sparkle, MessageSquarePlus, Pin, History,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Role = "user" | "assistant";
type CardKind = "candidate" | "exam" | "attendance" | "indicator";

interface Source { label: string; meta: string; href?: string }
interface MsgCard {
  kind: CardKind;
  title: string;
  rows: { k: string; v: string }[];
  actions: string[];
}
interface Message {
  id: string;
  role: Role;
  text: string;
  thinking?: string;
  sources?: Source[];
  card?: MsgCard;
  followups?: string[];
  streaming?: boolean;
}

const SCENES = [
  {
    key: "recruit", label: "招聘官", icon: Briefcase, color: "primary",
    desc: "JD 解析 · 简历匹配 · 面试评估",
    prompts: [
      "帮我筛选「激光工艺工程师」岗位的简历，重点看 5 年以上 + 划片机经验",
      "把候选人陈思雨的简历对照 JD 给一份评估报告",
      "生成一份激光工艺工程师的结构化面试题（含追问）",
    ],
  },
  {
    key: "perf", label: "绩效官", icon: BarChart3, color: "ai",
    desc: "目标对齐 · OKR 复盘 · 绩效面谈",
    prompts: [
      "本季度营销中心的 KPI 完成情况，列出 Top 3 风险",
      "为外贸组组长生成一份 Q3 绩效面谈提纲",
      "帮我把 Q4 OKR 拆到激光工艺组个人",
    ],
  },
  {
    key: "train", label: "培训官", icon: GraduationCap, color: "success",
    desc: "出卷批改 · 节点带教 · 知识沉淀",
    prompts: [
      "为激光划片机出一套 40 题安全复训试卷，覆盖黄龙山和鄂州",
      "主观题改完了吗？告诉我哪几份需要重点关注",
      "新员工王小明本周在岗培训进展如何？",
    ],
  },
  {
    key: "attend", label: "考勤官", icon: Clock, color: "warning",
    desc: "异常处置 · 排班建议 · 工时洞察",
    prompts: [
      "本周考勤异常都集中在哪些部门？",
      "组件车间下周排班建议（节假日 + 设备检修）",
      "外贸组 10 月加班工时统计",
    ],
  },
  {
    key: "emp", label: "员工档案官", icon: Users, color: "info",
    desc: "档案查询 · 异动 · 转正",
    prompts: [
      "查一下王小明的入职信息和当前在岗培训节点",
      "本月即将转正的员工名单",
      "供应链 / 仓储组在岗员工分布",
    ],
  },
  {
    key: "data", label: "数据洞察官", icon: BarChart3, color: "ai",
    desc: "跨模块洞察 · 周报月报",
    prompts: [
      "生成一份 11 月人事周报（招聘 / 培训 / 考勤）",
      "本月离职预警 Top 5",
      "对比黄龙山和鄂州两个基地的关键人事指标",
    ],
  },
] as const;

const accentMap = {
  primary: "text-primary bg-primary/10 border-primary/20",
  ai: "text-[hsl(var(--ai))] bg-[hsl(var(--ai-soft))] border-[hsl(var(--ai))]/20",
  success: "text-success bg-success/15 border-success/30",
  warning: "text-warning bg-warning/15 border-warning/30",
  info: "text-info bg-info/10 border-info/30",
} as const;

// 演示用：根据用户输入伪造一段流式回复
function buildMockReply(input: string): Message {
  const lower = input.toLowerCase();

  if (input.includes("简历") || input.includes("筛选")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "好的，我已按「激光工艺工程师 + 5 年以上 + 划片机经验」对当前简历库做了筛选。共命中 **8 位候选人**，其中 3 位与岗位 JD 高度匹配（≥85%）。下面是排名第一的候选人：",
      thinking: "拆解需求：岗位关键词=激光工艺工程师；硬条件=5 年以上 + 划片机经验。\n→ 在简历库 ResumeLibrary 检索 → 命中 24 → 加经验过滤 → 8\n→ 计算 JD 匹配度（关键词覆盖 + 项目相关度） → 排序 → Top 3 推送",
      card: {
        kind: "candidate",
        title: "陈思雨 · 8 年激光工艺",
        rows: [
          { k: "目标岗位", v: "激光工艺工程师" },
          { k: "JD 匹配度", v: "92%（关键词覆盖 11/12）" },
          { k: "现任", v: "某设备厂 · 工艺组组长" },
          { k: "核心经验", v: "划片机参数调试 · 光路调整 · 异常处置" },
          { k: "期望", v: "25-32K · 武汉" },
        ],
        actions: ["查看完整简历", "加入候选池", "安排面试", "@HRBP 共同评估"],
      },
      sources: [
        { label: "JD：激光工艺工程师", meta: "招聘 / 在招 12 个职位" },
        { label: "简历：陈思雨_8y_武汉.pdf", meta: "简历库 · 上传 11-12" },
        { label: "简历：李伟_6y_鄂州.pdf", meta: "简历库 · 上传 11-10" },
      ],
      followups: [
        "把 Top 3 候选人都生成评估报告",
        "按通勤距离重新排序",
        "生成结构化面试题",
      ],
    };
  }

  if (input.includes("试卷") || input.includes("出卷") || input.includes("出题")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "好的，已根据激光工艺组的现有培训材料生成一套试卷草案。客观题已自动出题，主观题留 2 道由 HR 选用。",
      thinking: "知识源：激光划片机安全 SOP / 设备保养手册 / 历史试题库 412 题\n题型分布：单选 24（基础）· 多选 10（参数+故障）· 判断 6（安全）\n难度：中（pass line 70）· 估算用时 60 分钟\n应考人数：黄龙山 18 + 鄂州 14 = 32",
      card: {
        kind: "exam",
        title: "激光划片机安全操作复训",
        rows: [
          { k: "题量 / 时长", v: "40 题 / 60 分钟" },
          { k: "题型分布", v: "单选 24 · 多选 10 · 判断 6" },
          { k: "覆盖厂区", v: "黄龙山基地 · 鄂州基地" },
          { k: "应考人数", v: "32 人" },
          { k: "难度 / 通过线", v: "中 · 70 分（可调）" },
        ],
        actions: ["发布到钉钉", "查看试卷", "调整难度", "AI 换题"],
      },
      sources: [
        { label: "SOP：激光划片机安全操作", meta: "培训材料 · 共 18 页" },
        { label: "题库：激光设备操作", meta: "412 题 · 18 套模板" },
        { label: "历史试卷 #1284", meta: "上次平均 91.4 分" },
      ],
      followups: [
        "先看主观题草案",
        "把难度调到偏难",
        "查看已应考人员名单",
      ],
    };
  }

  if (input.includes("批改") || input.includes("改完") || input.includes("主观题")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "客观题已完成自动判分；主观题共 8 份，AI 初评完成，待您复核。\n初评结果：**平均 7.2 / 10**，其中 2 份建议人工重点关注（答题逻辑偏差较大）。",
      thinking: "已读取试卷 #1283 的 8 份主观答卷 → 调用评分要点比对 → 输出 0-10 分 + 简评\n异常识别：得分 < 5 或与参考要点偏差 > 50% → 标记『需复核』",
      sources: [
        { label: "试卷 #1283 · ISO9001 质量意识复训", meta: "11-12 提交 · 参考 22 人" },
        { label: "评分要点：质量五要素", meta: "培训材料 · v3.2" },
      ],
      followups: ["打开批改队列", "只看异常 2 份", "导出成绩单到档案"],
    };
  }

  if (input.includes("考勤") || input.includes("异常") || input.includes("加班")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "本周考勤异常共 **27 条**，集中在 3 个部门：组件车间（11）、外贸组（8）、研发中心（4）。组件车间集中在夜班漏打卡，外贸组多为出差未报备。",
      thinking: "拉取 11-11 ~ 11-17 的考勤记录 → 异常类型分组 → 部门 Top → 生成解释",
      card: {
        kind: "attendance",
        title: "本周异常 Top 3 · 11-11 ~ 11-17",
        rows: [
          { k: "组件车间", v: "11 条 · 夜班漏打卡为主" },
          { k: "外贸组", v: "8 条 · 出差未报备" },
          { k: "研发中心", v: "4 条 · 弹性工时未确认" },
          { k: "处置建议", v: "组件车间增加夜班补卡入口；外贸组开启自动出差识别" },
        ],
        actions: ["进入异常处置", "导出 Excel", "@考勤主管"],
      },
      sources: [
        { label: "考勤异常清单 27 条", meta: "考勤模块 · 本周" },
        { label: "组件车间排班表", meta: "11-11 ~ 11-17" },
      ],
      followups: ["看组件车间详情", "和上周对比", "生成考勤周报"],
    };
  }

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: `已收到你的请求："${input}"。\n\n我会综合 **员工档案 / 招聘 / 培训 / 考勤 / 绩效** 五大数据域来回答。这是一个演示版回复，正式接入后将由人事 AI 智能体调用相应工具实时生成结果。`,
    thinking: "意图分类：通用咨询\n→ 默认走多模块综合检索；如属具体场景，请试试场景模板或更明确的提问。",
    followups: [
      "试试：本月考勤异常都集中在哪些部门？",
      "试试：为激光工艺组出一套 40 题安全复训试卷",
      "试试：查一下王小明的在岗培训节点",
    ],
  };
}

export default function ChatNew() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeScene, setActiveScene] = useState<typeof SCENES[number]["key"]>("recruit");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scene = SCENES.find((s) => s.key === activeScene)!;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (text?: string) => {
    const v = (text ?? input).trim();
    if (!v || streaming) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: v };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setStreaming(true);

    // 模拟流式：分多次 setState 拼接
    const reply = buildMockReply(v);
    const full = reply.text;
    const partial: Message = { ...reply, text: "", streaming: true, card: undefined, sources: undefined, followups: undefined };
    setMessages((m) => [...m, partial]);

    let i = 0;
    const tick = () => {
      i = Math.min(full.length, i + Math.max(2, Math.floor(Math.random() * 6)));
      setMessages((m) => m.map((x) => (x.id === partial.id ? { ...x, text: full.slice(0, i) } : x)));
      if (i < full.length) {
        setTimeout(tick, 30);
      } else {
        setMessages((m) => m.map((x) => (x.id === partial.id ? { ...reply, streaming: false } : x)));
        setStreaming(false);
      }
    };
    setTimeout(tick, 200);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <PageHeader
        title="新建对话"
        description="向人事 AI 员工发起会话 · 跨模块协同 · 即时调用工具"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("/chat/history")}>
              <History className="h-4 w-4 mr-1.5" />历史对话
            </Button>
            <Button size="sm" onClick={() => { setMessages([]); toast.success("已开启新会话"); }}>
              <MessageSquarePlus className="h-4 w-4 mr-1.5" />新会话
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-[280px_1fr] gap-0 h-[calc(100vh-var(--header-h,8rem))] min-h-[600px]">
        {/* 左：场景模板 */}
        <aside className="border-r bg-muted/20 overflow-y-auto">
          <div className="p-4 space-y-1">
            <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider px-2 mb-2">SCENES · 6</div>
            {SCENES.map((s) => {
              const Icon = s.icon;
              const active = s.key === activeScene;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveScene(s.key)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-md transition-colors flex items-start gap-2.5 border",
                    active ? accentMap[s.color] : "border-transparent hover:bg-background",
                  )}
                >
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", active ? "" : "text-muted-foreground")} />
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-sm font-medium", active ? "" : "text-foreground")}>{s.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-4 pb-4">
            <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider px-2 mb-2">
              {scene.label} · 推荐 Prompt
            </div>
            <div className="space-y-1.5">
              {scene.prompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p)}
                  disabled={streaming}
                  className="w-full text-left text-[11px] leading-relaxed bg-background border rounded-md px-2.5 py-2 hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  <Sparkle className="h-2.5 w-2.5 text-[hsl(var(--ai))] inline mr-1" />
                  {p}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 右：对话区 */}
        <div className="flex flex-col min-w-0 bg-background">
          {messages.length === 0 ? (
            <Welcome scene={scene} onPick={(p) => send(p)} />
          ) : (
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} msg={m} onFollowup={(t) => send(t)} />
              ))}
            </div>
          )}

          {/* 输入栏 */}
          <div className="border-t bg-background p-4">
            <div className="max-w-3xl mx-auto">
              <div className="relative bg-muted/40 border rounded-xl focus-within:border-primary transition-colors">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  rows={2}
                  placeholder={`向「${scene.label}」提问，例如：${scene.prompts[0].slice(0, 24)}...`}
                  className="min-h-[60px] resize-none bg-transparent border-0 focus-visible:ring-0 pr-14 pb-9 text-sm"
                  disabled={streaming}
                />
                <div className="absolute left-2 bottom-2 flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={streaming}>
                    <Paperclip className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={streaming}>
                    <Mic className="h-3.5 w-3.5" />
                  </Button>
                  <Badge variant="outline" className="ml-1 font-mono text-[10px] font-normal">
                    @ {scene.label}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  className="absolute right-2 bottom-2 h-7 w-7 p-0"
                  disabled={!input.trim() || streaming}
                  onClick={() => send()}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 text-center font-mono">
                Enter 发送 · Shift + Enter 换行 · 答案可能不准确，请二次核对
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Welcome({ scene, onPick }: { scene: typeof SCENES[number]; onPick: (p: string) => void }) {
  const Icon = scene.icon;
  return (
    <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full text-center">
        <div className={cn("h-14 w-14 rounded-2xl mx-auto mb-4 flex items-center justify-center border", accentMap[scene.color])}>
          <Icon className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-semibold mb-1">你好，我是「{scene.label}」</h2>
        <p className="text-sm text-muted-foreground mb-8">{scene.desc} · 我可以读取员工档案 / 招聘 / 培训 / 考勤 / 绩效模块的实时数据</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {scene.prompts.map((p, i) => (
            <button
              key={i}
              onClick={() => onPick(p)}
              className="text-left p-3 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors group"
            >
              <Sparkle className="h-3 w-3 text-[hsl(var(--ai))] mb-1.5" />
              <div className="text-[11px] leading-relaxed text-foreground/80 group-hover:text-foreground">{p}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onFollowup }: { msg: Message; onFollowup: (t: string) => void }) {
  const [showThink, setShowThink] = useState(false);

  if (msg.role === "user") {
    return (
      <div className="flex gap-3 justify-end max-w-3xl mx-auto w-full">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%]">
          <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</div>
        </div>
        <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-muted">我</AvatarFallback></Avatar>
      </div>
    );
  }

  return (
    <div className="flex gap-3 max-w-3xl mx-auto w-full">
      <Avatar className="h-7 w-7">
        <AvatarFallback className="text-[10px] bg-[hsl(var(--ai-soft))] text-[hsl(var(--ai))]">
          <Sparkles className="h-3.5 w-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-2">
        {/* 思考过程折叠 */}
        {msg.thinking && (
          <button
            onClick={() => setShowThink(!showThink)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {showThink ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <Brain className="h-3 w-3" />
            <span className="font-mono">思考过程</span>
          </button>
        )}
        {showThink && msg.thinking && (
          <div className="text-[11px] text-muted-foreground bg-muted/40 border-l-2 border-[hsl(var(--ai))] px-3 py-2 rounded whitespace-pre-wrap leading-relaxed">
            {msg.thinking}
          </div>
        )}

        {/* 正文 */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {renderInline(msg.text)}
          {msg.streaming && <span className="inline-block w-1.5 h-3.5 bg-foreground/60 ml-0.5 animate-pulse align-middle" />}
        </div>

        {/* 卡片回执 */}
        {msg.card && <CardReceipt card={msg.card} />}

        {/* 引用源 */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="pt-1">
            <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5 tracking-wider">引用 · {msg.sources.length}</div>
            <div className="flex flex-wrap gap-1.5">
              {msg.sources.map((s, i) => (
                <button
                  key={i}
                  onClick={() => toast.info(`打开「${s.label}」`)}
                  className="inline-flex items-center gap-1 text-[11px] bg-muted hover:bg-muted/70 border rounded-md px-2 py-1 transition-colors group"
                >
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{s.label}</span>
                  <span className="text-muted-foreground">· {s.meta}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 工具栏 */}
        {!msg.streaming && (
          <div className="flex items-center gap-0.5 pt-0.5 -ml-1.5">
            <IconAction icon={Copy} label="复制" onClick={() => toast.success("已复制")} />
            <IconAction icon={ThumbsUp} label="赞" onClick={() => toast.success("感谢反馈")} />
            <IconAction icon={ThumbsDown} label="不准" onClick={() => toast.info("已记录，将用于改进")} />
            <IconAction icon={RotateCcw} label="重新生成" onClick={() => toast.info("正在重新生成")} />
          </div>
        )}

        {/* 建议追问 */}
        {!msg.streaming && msg.followups && msg.followups.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {msg.followups.map((f, i) => (
              <button
                key={i}
                onClick={() => onFollowup(f)}
                className="text-[11px] border border-dashed rounded-full px-2.5 py-1 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <Sparkle className="h-2.5 w-2.5 text-[hsl(var(--ai))] inline mr-1" />
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CardReceipt({ card }: { card: MsgCard }) {
  const tone =
    card.kind === "candidate" ? "primary" :
    card.kind === "exam" ? "success" :
    card.kind === "attendance" ? "warning" : "ai";
  return (
    <Card className={cn("p-3.5 border-l-2", {
      primary: "border-l-primary bg-primary/5",
      success: "border-l-success bg-success/5",
      warning: "border-l-warning bg-warning/5",
      ai: "border-l-[hsl(var(--ai))] bg-[hsl(var(--ai-soft))]/40",
    }[tone])}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold">{card.title}</div>
        <Badge variant="outline" className="font-mono text-[10px] font-normal">
          {{ candidate: "候选人", exam: "试卷草案", attendance: "考勤洞察", indicator: "指标卡" }[card.kind]}
        </Badge>
      </div>
      <div className="space-y-1 text-[11px]">
        {card.rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-muted-foreground">{r.k}</span>
            <span className="text-foreground">{r.v}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-dashed">
        {card.actions.map((a, i) => (
          <Button
            key={i}
            variant={i === 0 ? "default" : "outline"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => toast.success(`已执行：${a}`)}
          >
            {a}
          </Button>
        ))}
      </div>
    </Card>
  );
}

function IconAction({ icon: Icon, label, onClick }: { icon: typeof Copy; label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" title={label} onClick={onClick}>
      <Icon className="h-3 w-3" />
    </Button>
  );
}

// 简易 inline markdown：支持 **bold**
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}
