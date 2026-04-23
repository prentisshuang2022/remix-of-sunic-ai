import { useState } from "react";
import {
  BookOpen,
  Search,
  Upload,
  FileText,
  Scale,
  Shield,
  Landmark,
  FolderOpen,
  Clock,
  Eye,
  Download,
  Trash2,
  Plus,
  Sparkles,
  Send,
  Filter,
  ChevronRight,
  Tag,
  File,
  MoreHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── 分类定义 ── */
const CATEGORIES = [
  { id: "all", label: "全部", icon: FolderOpen, count: 42 },
  { id: "law", label: "法律法规", icon: Scale, count: 15 },
  { id: "policy", label: "人资政策", icon: Landmark, count: 12 },
  { id: "sop", label: "操作规程", icon: Shield, count: 8 },
  { id: "template", label: "模板表单", icon: FileText, count: 7 },
];

/* ── Mock 文档 ── */
const MOCK_DOCS: Doc[] = [
  { id: "1", title: "《劳动合同法》（2024 修订版）", category: "law", tags: ["劳动法", "合同"], fileType: "PDF", fileSize: "2.4 MB", updatedAt: "2024-12-10", updatedBy: "系统导入", status: "published", views: 328 },
  { id: "2", title: "《社会保险法》全文", category: "law", tags: ["社保", "五险"], fileType: "PDF", fileSize: "1.8 MB", updatedAt: "2024-11-22", updatedBy: "系统导入", status: "published", views: 215 },
  { id: "3", title: "《女职工劳动保护特别规定》", category: "law", tags: ["女职工", "产假"], fileType: "PDF", fileSize: "680 KB", updatedAt: "2024-10-15", updatedBy: "张静", status: "published", views: 142 },
  { id: "4", title: "员工考勤管理制度 v3.2", category: "policy", tags: ["考勤", "迟到", "加班"], fileType: "Word", fileSize: "520 KB", updatedAt: "2025-03-18", updatedBy: "李红", status: "published", views: 456 },
  { id: "5", title: "薪酬福利管理办法（2025）", category: "policy", tags: ["薪酬", "福利", "绩效奖"], fileType: "Word", fileSize: "890 KB", updatedAt: "2025-02-20", updatedBy: "王军", status: "published", views: 387 },
  { id: "6", title: "年休假管理规定", category: "policy", tags: ["年假", "调休"], fileType: "PDF", fileSize: "340 KB", updatedAt: "2025-01-10", updatedBy: "李红", status: "published", views: 298 },
  { id: "7", title: "员工入职办理流程 SOP", category: "sop", tags: ["入职", "流程"], fileType: "PDF", fileSize: "1.2 MB", updatedAt: "2025-03-05", updatedBy: "赵丽", status: "published", views: 189 },
  { id: "8", title: "离职交接操作规程", category: "sop", tags: ["离职", "交接"], fileType: "Word", fileSize: "450 KB", updatedAt: "2025-02-28", updatedBy: "赵丽", status: "published", views: 167 },
  { id: "9", title: "工伤报备处理流程", category: "sop", tags: ["工伤", "报备"], fileType: "PDF", fileSize: "780 KB", updatedAt: "2024-12-20", updatedBy: "王军", status: "draft", views: 45 },
  { id: "10", title: "劳动合同模板（固定期限）", category: "template", tags: ["合同", "模板"], fileType: "Word", fileSize: "125 KB", updatedAt: "2025-04-01", updatedBy: "李红", status: "published", views: 512 },
  { id: "11", title: "员工保密协议模板", category: "template", tags: ["保密", "协议"], fileType: "Word", fileSize: "98 KB", updatedAt: "2025-03-12", updatedBy: "张静", status: "published", views: 234 },
  { id: "12", title: "试用期考核评价表", category: "template", tags: ["试用期", "考核"], fileType: "Excel", fileSize: "67 KB", updatedAt: "2025-03-20", updatedBy: "赵丽", status: "published", views: 178 },
];

interface Doc {
  id: string;
  title: string;
  category: string;
  tags: string[];
  fileType: string;
  fileSize: string;
  updatedAt: string;
  updatedBy: string;
  status: "published" | "draft";
  views: number;
}

/* ── AI 问答 Mock ── */
interface QAMessage {
  role: "user" | "ai";
  text: string;
}

const fileTypeIcon: Record<string, string> = {
  PDF: "bg-danger-soft text-danger",
  Word: "bg-info-soft text-info",
  Excel: "bg-success-soft text-success",
};

export default function KnowledgeBase() {
  const [activeCat, setActiveCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [qaOpen, setQaOpen] = useState(false);
  const [qaInput, setQaInput] = useState("");
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [detailDoc, setDetailDoc] = useState<Doc | null>(null);

  /* 筛选 */
  const filtered = MOCK_DOCS.filter((d) => {
    if (activeCat !== "all" && d.category !== activeCat) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.tags.some((t) => t.includes(q))
      );
    }
    return true;
  });

  /* AI 问答 */
  const handleAskAI = () => {
    if (!qaInput.trim()) return;
    const question = qaInput.trim();
    setQaMessages((prev) => [...prev, { role: "user", text: question }]);
    setQaInput("");
    setQaLoading(true);
    // [BACKEND] 需要后端 AI API 支持知识库检索与问答
    setTimeout(() => {
      const mockAnswers: Record<string, string> = {
        default: `根据知识库中的相关文档，为您检索到以下信息：\n\n1. 《劳动合同法》第三十八条规定，用人单位未及时足额支付劳动报酬的，劳动者可以解除劳动合同。\n2. 公司《薪酬福利管理办法》中明确了薪资发放时间为每月15日。\n\n📎 引用来源：《劳动合同法》（2024修订版）、薪酬福利管理办法（2025）`,
      };
      setQaMessages((prev) => [
        ...prev,
        { role: "ai", text: mockAnswers.default },
      ]);
      setQaLoading(false);
    }, 1500);
  };

  /* 上传 */
  const [uploadForm, setUploadForm] = useState({
    category: "",
    tags: "",
    file: null as File | null,
  });

  const handleUpload = () => {
    if (!uploadForm.file || !uploadForm.category) {
      toast.error("请选择文件和分类");
      return;
    }
    // [BACKEND] 需要后端文件上传与 AI 解析支持
    toast.success("文件上传成功", {
      description: `${uploadForm.file.name} 已上传，AI 正在解析文档内容…`,
    });
    setUploadOpen(false);
    setUploadForm({ category: "", tags: "", file: null });
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="人资知识库"
        description="人资法律法规、政策制度、操作规程统一管理与智能检索"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQaOpen(true)}
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              AI 问答
            </Button>
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="mr-1.5 h-4 w-4" />
              上传文档
            </Button>
          </div>
        }
      />

      <div className="space-y-5 p-6">
        {/* ── KPI 统计 ── */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "文档总数", value: "42", icon: FileText, accent: "primary" as const, sub: "本月新增 5 份" },
            { label: "法律法规", value: "15", icon: Scale, accent: "warning" as const, sub: "3 份近期更新" },
            { label: "本月查阅", value: "1,247", icon: Eye, accent: "info" as const, sub: "↑ 23% 环比" },
            { label: "AI 问答", value: "89", icon: Sparkles, accent: "ai" as const, sub: "本月提问次数" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  s.accent === "primary" && "bg-primary-soft text-primary",
                  s.accent === "warning" && "bg-warning-soft text-warning",
                  s.accent === "info" && "bg-info-soft text-info",
                  s.accent === "ai" && "bg-ai-soft text-ai",
                )}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-semibold tabular-nums">{s.value}</div>
                <div className="text-xs text-muted-foreground truncate">{s.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 搜索 + 分类 ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={activeCat} onValueChange={setActiveCat}>
            <TabsList>
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="gap-1.5">
                  <c.icon className="h-3.5 w-3.5" />
                  {c.label}
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                    {c.id === "all" ? MOCK_DOCS.length : c.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索文档标题、标签…"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ── 文档列表 ── */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <FolderOpen className="h-10 w-10 mb-2 opacity-40" />
                  <p className="text-sm">暂无匹配的文档</p>
                </div>
              )}
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors cursor-pointer group"
                  onClick={() => setDetailDoc(doc)}
                >
                  {/* 文件类型图标 */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      fileTypeIcon[doc.fileType] ?? "bg-muted text-muted-foreground",
                    )}
                  >
                    {doc.fileType}
                  </div>

                  {/* 文档信息 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{doc.title}</span>
                      {doc.status === "draft" && (
                        <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">
                          草稿
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {doc.tags.join("、")}
                      </span>
                      <span>{doc.fileSize}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {doc.updatedAt}
                      </span>
                      <span>{doc.updatedBy}</span>
                    </div>
                  </div>

                  {/* 右侧操作 */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {doc.views}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success("已开始下载", { description: doc.title });
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.error("已删除", { description: doc.title });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── AI 洞察 ── */}
        <div className="ai-card flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ai text-ai-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">AI 知识库洞察</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              检测到 3 份法律法规文档有新版本发布，建议及时更新；《员工考勤管理制度》被引用 456 次，为最热门文档；近 7 天有 12 次关于「产假天数」的重复提问，建议将答案置顶为常见问题。
            </p>
          </div>
        </div>
      </div>

      {/* ══ 上传文档 Dialog ══ */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>上传文档</DialogTitle>
            <DialogDescription>上传 PDF / Word / Excel，AI 将自动解析并归入知识库</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">选择分类</label>
              <Select
                value={uploadForm.category}
                onValueChange={(v) => setUploadForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择文档分类" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">标签（逗号分隔）</label>
              <Input
                placeholder="如：劳动法, 合同, 产假"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">选择文件</label>
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                  uploadForm.file ? "border-primary/40 bg-primary-soft" : "border-border hover:border-primary/30",
                )}
              >
                {uploadForm.file ? (
                  <div className="text-center">
                    <File className="mx-auto h-8 w-8 text-primary mb-2" />
                    <p className="text-sm font-medium">{uploadForm.file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 text-xs"
                      onClick={() => setUploadForm((f) => ({ ...f, file: null }))}
                    >
                      重新选择
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">点击或拖拽上传</p>
                    <p className="text-xs text-muted-foreground mt-1">支持 PDF、Word、Excel，单文件最大 20MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  style={{ position: "absolute", inset: 0, cursor: "pointer", opacity: 0 }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadForm((f) => ({ ...f, file }));
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>取消</Button>
            <Button onClick={handleUpload}>
              <Upload className="mr-1.5 h-4 w-4" />
              上传并解析
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ AI 问答 Dialog ══ */}
      <Dialog open={qaOpen} onOpenChange={setQaOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-ai" />
              AI 知识库问答
            </DialogTitle>
            <DialogDescription>基于知识库文档进行智能检索与问答</DialogDescription>
          </DialogHeader>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto space-y-3 py-3 min-h-[240px] max-h-[400px]">
            {qaMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Sparkles className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">试试问我关于人资政策和法规的问题</p>
                <div className="flex flex-wrap gap-2 mt-3 max-w-sm justify-center">
                  {["产假天数规定？", "试用期最长多久？", "加班工资如何计算？"].map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setQaInput(q);
                      }}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {qaMessages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {qaLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-ai animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-ai animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-ai animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  正在检索知识库…
                </div>
              </div>
            )}
          </div>

          {/* 输入区 */}
          <div className="flex gap-2 pt-2 border-t">
            <Input
              placeholder="输入您的问题…"
              value={qaInput}
              onChange={(e) => setQaInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAskAI()}
            />
            <Button size="icon" onClick={handleAskAI} disabled={qaLoading || !qaInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ 文档详情 Dialog ══ */}
      <Dialog open={!!detailDoc} onOpenChange={() => setDetailDoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base leading-snug">{detailDoc?.title}</DialogTitle>
            <DialogDescription>文档详情</DialogDescription>
          </DialogHeader>
          {detailDoc && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">分类</span>
                  <p className="font-medium mt-0.5">
                    {CATEGORIES.find((c) => c.id === detailDoc.category)?.label}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">文件类型</span>
                  <p className="font-medium mt-0.5">{detailDoc.fileType} · {detailDoc.fileSize}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">更新时间</span>
                  <p className="font-medium mt-0.5">{detailDoc.updatedAt}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">更新人</span>
                  <p className="font-medium mt-0.5">{detailDoc.updatedBy}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">状态</span>
                  <p className="mt-0.5">
                    <Badge variant={detailDoc.status === "published" ? "default" : "outline"}>
                      {detailDoc.status === "published" ? "已发布" : "草稿"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">查阅次数</span>
                  <p className="font-medium mt-0.5">{detailDoc.views} 次</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">标签</span>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {detailDoc.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDoc(null)}>关闭</Button>
            <Button
              onClick={() => {
                toast.success("已开始下载", { description: detailDoc?.title });
                setDetailDoc(null);
              }}
            >
              <Download className="mr-1.5 h-4 w-4" />
              下载文档
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
