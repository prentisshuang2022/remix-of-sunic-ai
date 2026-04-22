import { useMemo, useState } from "react";
import {
  Upload,
  Search,
  FileText,
  Sparkles,
  GraduationCap,
  Briefcase,
  MapPin,
  Tag,
  Filter,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

type ParseStatus = "已解析" | "解析中" | "解析失败";

interface Resume {
  id: string;
  name: string;
  gender: "男" | "女";
  age: number;
  education: "本科" | "硕士" | "博士" | "大专";
  school: string;
  years: number;
  currentTitle: string;
  currentCompany: string;
  city: string;
  expectSalary: string;
  skills: string[];
  source: "Boss直聘" | "猎聘" | "拉勾" | "智联" | "内推";
  uploadedAt: string;
  status: ParseStatus;
  fileName: string;
  highlights: string[];
}

const resumes: Resume[] = [
  {
    id: "R001",
    name: "张子豪",
    gender: "男",
    age: 28,
    education: "硕士",
    school: "上海交通大学",
    years: 5,
    currentTitle: "高级前端工程师",
    currentCompany: "字节跳动",
    city: "上海",
    expectSalary: "30-40K",
    skills: ["React", "TypeScript", "Vue", "Webpack", "Node.js"],
    source: "Boss直聘",
    uploadedAt: "2025-04-15 10:23",
    status: "已解析",
    fileName: "张子豪-前端-5年.pdf",
    highlights: ["大厂背景", "技术栈匹配度高", "有团队管理经验"],
  },
  {
    id: "R002",
    name: "李雨欣",
    gender: "女",
    age: 26,
    education: "本科",
    school: "华东师范大学",
    years: 3,
    currentTitle: "前端工程师",
    currentCompany: "携程",
    city: "上海",
    expectSalary: "22-28K",
    skills: ["React", "TypeScript", "Next.js", "TailwindCSS"],
    source: "猎聘",
    uploadedAt: "2025-04-15 09:45",
    status: "已解析",
    fileName: "李雨欣-前端.pdf",
    highlights: ["技术栈完全匹配", "稳定性好"],
  },
  {
    id: "R003",
    name: "王浩然",
    gender: "男",
    age: 31,
    education: "本科",
    school: "复旦大学",
    years: 8,
    currentTitle: "数据分析专家",
    currentCompany: "拼多多",
    city: "杭州",
    expectSalary: "35-45K",
    skills: ["Python", "SQL", "Tableau", "机器学习", "A/B Testing"],
    source: "猎聘",
    uploadedAt: "2025-04-14 16:30",
    status: "已解析",
    fileName: "王浩然-数据分析.pdf",
    highlights: ["资深背景", "电商行业经验"],
  },
  {
    id: "R004",
    name: "陈思琪",
    gender: "女",
    age: 24,
    education: "本科",
    school: "南京大学",
    years: 1,
    currentTitle: "数据分析师",
    currentCompany: "网易",
    city: "杭州",
    expectSalary: "15-20K",
    skills: ["SQL", "Python", "Excel", "PowerBI"],
    source: "拉勾",
    uploadedAt: "2025-04-14 14:12",
    status: "已解析",
    fileName: "陈思琪.pdf",
    highlights: ["年轻有潜力", "学习能力强"],
  },
  {
    id: "R005",
    name: "刘建国",
    gender: "男",
    age: 35,
    education: "大专",
    school: "苏州工业园区职业技术学院",
    years: 12,
    currentTitle: "生产主管",
    currentCompany: "富士康",
    city: "苏州",
    expectSalary: "12-15K",
    skills: ["精益生产", "5S", "团队管理", "ISO9001"],
    source: "Boss直聘",
    uploadedAt: "2025-04-13 11:00",
    status: "已解析",
    fileName: "刘建国-生产主管.docx",
    highlights: ["12 年一线经验", "管理过 80 人团队"],
  },
  {
    id: "R006",
    name: "赵敏",
    gender: "女",
    age: 32,
    education: "硕士",
    school: "中央财经大学",
    years: 8,
    currentTitle: "财务经理",
    currentCompany: "普华永道",
    city: "上海",
    expectSalary: "30-38K",
    skills: ["CPA", "SAP", "财务分析", "税务筹划", "IFRS"],
    source: "猎聘",
    uploadedAt: "2025-04-12 17:20",
    status: "已解析",
    fileName: "赵敏-财务.pdf",
    highlights: ["CPA + 四大背景", "IPO 经验"],
  },
  {
    id: "R007",
    name: "孙晓东",
    gender: "男",
    age: 29,
    education: "本科",
    school: "北京邮电大学",
    years: 6,
    currentTitle: "全栈工程师",
    currentCompany: "美团",
    city: "上海",
    expectSalary: "32-40K",
    skills: ["React", "Node.js", "Go", "MySQL", "Redis"],
    source: "Boss直聘",
    uploadedAt: "2025-04-16 09:10",
    status: "解析中",
    fileName: "孙晓东-简历.pdf",
    highlights: [],
  },
  {
    id: "R008",
    name: "周楠",
    gender: "女",
    age: 27,
    education: "本科",
    school: "浙江大学",
    years: 4,
    currentTitle: "前端工程师",
    currentCompany: "蚂蚁集团",
    city: "杭州",
    expectSalary: "25-32K",
    skills: ["React", "TypeScript", "微前端", "可视化"],
    source: "内推",
    uploadedAt: "2025-04-11 15:00",
    status: "已解析",
    fileName: "周楠.pdf",
    highlights: ["大厂经验", "可视化方向"],
  },
];

const statusStyle: Record<ParseStatus, string> = {
  已解析: "bg-success-soft text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]",
  解析中: "bg-info-soft text-[hsl(var(--info))] border-[hsl(var(--info)/0.3)]",
  解析失败: "bg-danger-soft text-[hsl(var(--danger))] border-[hsl(var(--danger)/0.3)]",
};

export function ResumeLibraryPanel() {
  const [keyword, setKeyword] = useState("");
  const [education, setEducation] = useState("all");
  const [city, setCity] = useState("all");
  const [source, setSource] = useState("all");
  const [years, setYears] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = useMemo(() => {
    return resumes.filter((r) => {
      if (education !== "all" && r.education !== education) return false;
      if (city !== "all" && r.city !== city) return false;
      if (source !== "all" && r.source !== source) return false;
      if (years !== "all") {
        const [min, max] = years.split("-").map(Number);
        if (r.years < min || r.years > max) return false;
      }
      if (keyword) {
        const k = keyword.toLowerCase();
        const hit =
          r.name.includes(keyword) ||
          r.currentTitle.toLowerCase().includes(k) ||
          r.skills.some((s) => s.toLowerCase().includes(k));
        if (!hit) return false;
      }
      return true;
    });
  }, [keyword, education, city, source, years]);

  const allChecked = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) filtered.forEach((r) => next.delete(r.id));
    else filtered.forEach((r) => next.add(r.id));
    setSelected(next);
  };
  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const opened = resumes.find((r) => r.id === openId);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" />批量导出
        </Button>
        <Button size="sm" onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" />上传简历
        </Button>
      </div>

      <div className="space-y-4">
        {/* 统计 */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="简历总数" value={resumes.length} icon={FileText} tone="primary" />
          <StatTile
            label="已解析"
            value={resumes.filter((r) => r.status === "已解析").length}
            icon={CheckCircle2}
            tone="success"
          />
          <StatTile
            label="解析中"
            value={resumes.filter((r) => r.status === "解析中").length}
            icon={Loader2}
            tone="info"
          />
          <StatTile label="本周新增" value={5} icon={Sparkles} tone="warning" />
        </div>

        {/* 筛选 */}
        <Card className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="姓名 / 职位 / 技能"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="h-9 w-[220px] pl-8"
              />
            </div>
            <Select value={education} onValueChange={setEducation}>
              <SelectTrigger className="h-9 w-[110px]"><SelectValue placeholder="学历" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部学历</SelectItem>
                <SelectItem value="大专">大专</SelectItem>
                <SelectItem value="本科">本科</SelectItem>
                <SelectItem value="硕士">硕士</SelectItem>
                <SelectItem value="博士">博士</SelectItem>
              </SelectContent>
            </Select>
            <Select value={years} onValueChange={setYears}>
              <SelectTrigger className="h-9 w-[120px]"><SelectValue placeholder="工作年限" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部年限</SelectItem>
                <SelectItem value="0-2">0-2 年</SelectItem>
                <SelectItem value="3-5">3-5 年</SelectItem>
                <SelectItem value="6-10">6-10 年</SelectItem>
                <SelectItem value="11-99">10 年以上</SelectItem>
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="h-9 w-[110px]"><SelectValue placeholder="城市" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部城市</SelectItem>
                <SelectItem value="上海">上海</SelectItem>
                <SelectItem value="杭州">杭州</SelectItem>
                <SelectItem value="苏州">苏州</SelectItem>
                <SelectItem value="深圳">深圳</SelectItem>
              </SelectContent>
            </Select>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="h-9 w-[120px]"><SelectValue placeholder="来源" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                <SelectItem value="Boss直聘">Boss直聘</SelectItem>
                <SelectItem value="猎聘">猎聘</SelectItem>
                <SelectItem value="拉勾">拉勾</SelectItem>
                <SelectItem value="智联">智联</SelectItem>
                <SelectItem value="内推">内推</SelectItem>
              </SelectContent>
            </Select>
            {selected.size > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground">已选 {selected.size}</span>
                <Button size="sm" variant="outline">
                  <Tag className="h-4 w-4" />打标签
                </Button>
                <Button size="sm">
                  <Sparkles className="h-4 w-4" />匹配到岗位
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* 表格 */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>候选人</TableHead>
                <TableHead>学历 / 年限</TableHead>
                <TableHead>当前职位</TableHead>
                <TableHead>技能标签</TableHead>
                <TableHead>期望薪资</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-24 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggle(r.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.gender} · {r.age} 岁 · {r.city}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{r.education}</div>
                    <div className="text-xs text-muted-foreground">{r.years} 年经验</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{r.currentTitle}</div>
                    <div className="text-xs text-muted-foreground">{r.currentCompany}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.skills.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[11px] font-normal">
                          {s}
                        </Badge>
                      ))}
                      {r.skills.length > 3 && (
                        <Badge variant="outline" className="text-[11px] font-normal">
                          +{r.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">{r.expectSalary}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.source}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyle[r.status]}>
                      {r.status === "解析中" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setOpenId(r.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-sm text-muted-foreground">
                    无匹配简历
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* 上传抽屉 */}
      <Sheet open={uploadOpen} onOpenChange={setUploadOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>上传简历</SheetTitle>
            <SheetDescription>
              支持 PDF / Word，单次最多 50 份，AI 将自动解析并提取关键信息
            </SheetDescription>
          </SheetHeader>
          <div className="mt-5 space-y-4">
            <div className="rounded-lg border-2 border-dashed bg-muted/30 p-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <div className="mt-3 text-sm font-medium">拖拽文件到此处，或点击选择</div>
              <div className="mt-1 text-xs text-muted-foreground">支持 .pdf .doc .docx</div>
              <Button size="sm" className="mt-4">选择文件</Button>
            </div>
            <div>
              <label className="text-sm font-medium">来源渠道</label>
              <Select defaultValue="Boss直聘">
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Boss直聘">Boss直聘</SelectItem>
                  <SelectItem value="猎聘">猎聘</SelectItem>
                  <SelectItem value="拉勾">拉勾</SelectItem>
                  <SelectItem value="智联">智联</SelectItem>
                  <SelectItem value="内推">内推</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="ai-card">
              <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--ai))]">
                <Sparkles className="h-4 w-4" />AI 自动解析项
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>· 基础信息：姓名 / 性别 / 年龄 / 联系方式 / 城市</li>
                <li>· 教育背景：学历 / 学校 / 专业 / 毕业时间</li>
                <li>· 工作经历：公司 / 职位 / 时间段 / 工作内容</li>
                <li>· 技能标签：自动识别技术栈与软技能</li>
                <li>· 期望：薪资范围 / 期望城市 / 期望行业</li>
              </ul>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                toast({ title: "已加入解析队列", description: "AI 将在 1 分钟内完成解析" });
                setUploadOpen(false);
              }}
            >
              开始上传并解析
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 详情抽屉 */}
      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-[560px] sm:max-w-[560px] overflow-y-auto">
          {opened && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {opened.name}
                  <Badge variant="outline" className={statusStyle[opened.status]}>
                    {opened.status}
                  </Badge>
                </SheetTitle>
                <SheetDescription>
                  {opened.gender} · {opened.age} 岁 · {opened.city} · 期望 {opened.expectSalary}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-5 space-y-5">
                <section>
                  <SectionTitle icon={GraduationCap}>教育背景</SectionTitle>
                  <div className="text-sm">
                    {opened.school} · {opened.education}
                  </div>
                </section>
                <section>
                  <SectionTitle icon={Briefcase}>当前在职</SectionTitle>
                  <div className="text-sm">
                    {opened.currentCompany} · {opened.currentTitle}
                  </div>
                  <div className="text-xs text-muted-foreground">{opened.years} 年经验</div>
                </section>
                <section>
                  <SectionTitle icon={Tag}>技能标签</SectionTitle>
                  <div className="flex flex-wrap gap-1.5">
                    {opened.skills.map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </section>
                {opened.highlights.length > 0 && (
                  <section className="ai-card">
                    <SectionTitle icon={Sparkles} className="text-[hsl(var(--ai))]">
                      AI 摘要亮点
                    </SectionTitle>
                    <ul className="space-y-1 text-sm">
                      {opened.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-1.5">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--ai))]" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                <section>
                  <SectionTitle icon={FileText}>原始简历</SectionTitle>
                  <div className="flex items-center justify-between rounded-md border bg-muted/30 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {opened.fileName}
                    </div>
                    <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    来源：{opened.source} · 上传于 {opened.uploadedAt}
                  </div>
                </section>
                <div className="flex gap-2 border-t pt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Trash2 className="h-4 w-4" />删除
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Sparkles className="h-4 w-4" />匹配到岗位
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
  tone: "primary" | "success" | "warning" | "info";
}) {
  const map = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-[hsl(var(--success))]",
    warning: "bg-warning-soft text-[hsl(var(--warning-foreground))]",
    info: "bg-info-soft text-[hsl(var(--info))]",
  };
  return (
    <div className="stat-card">
      <div className={`flex h-9 w-9 items-center justify-center rounded-md ${map[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
  className = "",
}: {
  icon: typeof FileText;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}
