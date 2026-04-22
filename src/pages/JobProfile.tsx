import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Sparkles,
  Plus,
  X,
  Wand2,
  Check,
  AlertCircle,
  Users,
  Save,
  PlayCircle,
  GripVertical,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface ProfileItem {
  id: string;
  text: string;
}

interface Dimension {
  key: string;
  label: string;
  weight: number;
  desc: string;
}

const defaultJD = `岗位职责：
1. 负责公司核心业务前端架构设计与开发
2. 推动前端工程化、组件化、性能优化
3. 与产品、设计、后端协作完成需求交付
4. 带领 2-3 人小组，输出技术方案

任职要求：
1. 本科及以上学历，计算机相关专业
2. 5 年以上前端开发经验
3. 精通 React / TypeScript，熟悉 Vue
4. 熟悉前端工程化（Webpack / Vite）
5. 有大型项目或团队管理经验者优先`;

export default function JobProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [generated, setGenerated] = useState(true);
  const [jd, setJd] = useState(defaultJD);

  const [hardReqs, setHardReqs] = useState<ProfileItem[]>([
    { id: "h1", text: "本科及以上学历，计算机相关专业" },
    { id: "h2", text: "5 年以上前端开发经验" },
    { id: "h3", text: "精通 React 与 TypeScript" },
    { id: "h4", text: "工作地点：上海" },
  ]);
  const [bonus, setBonus] = useState<ProfileItem[]>([
    { id: "b1", text: "有大型 C 端项目经验" },
    { id: "b2", text: "有团队管理经验" },
    { id: "b3", text: "熟悉 Vue / Next.js" },
    { id: "b4", text: "活跃的开源贡献" },
  ]);
  const [excludes, setExcludes] = useState<ProfileItem[]>([
    { id: "e1", text: "工作经验少于 3 年" },
    { id: "e2", text: "近 3 年平均跳槽周期 < 12 个月" },
  ]);

  const [dims, setDims] = useState<Dimension[]>([
    { key: "skill", label: "技能匹配", weight: 35, desc: "技术栈与岗位要求的吻合度" },
    { key: "exp", label: "工作经验", weight: 25, desc: "年限与项目背景" },
    { key: "edu", label: "教育背景", weight: 15, desc: "学历与院校层次" },
    { key: "stable", label: "稳定性", weight: 15, desc: "平均在职时长" },
    { key: "salary", label: "薪资契合", weight: 10, desc: "期望薪资落在岗位区间内" },
  ]);

  const totalWeight = dims.reduce((s, d) => s + d.weight, 0);

  const handleGenerate = () => {
    setGenerated(true);
    toast({ title: "AI 已生成岗位画像", description: "可基于业务实际进一步调整权重" });
  };

  const addItem = (
    setter: React.Dispatch<React.SetStateAction<ProfileItem[]>>,
    prefix: string,
  ) => setter((arr) => [...arr, { id: `${prefix}${Date.now()}`, text: "" }]);

  const updateItem = (
    setter: React.Dispatch<React.SetStateAction<ProfileItem[]>>,
    id: string,
    text: string,
  ) => setter((arr) => arr.map((it) => (it.id === id ? { ...it, text } : it)));

  const removeItem = (
    setter: React.Dispatch<React.SetStateAction<ProfileItem[]>>,
    id: string,
  ) => setter((arr) => arr.filter((it) => it.id !== id));

  return (
    <div className="flex flex-col">
      <PageHeader
        title="岗位画像"
        description="AI 基于岗位 JD 生成结构化筛选规则，可调整权重并触发智能匹配"
        backTo="/recruiting"
        backLabel="返回招聘需求池"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4" />保存草稿
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast({ title: "已开始智能筛选", description: "正在从简历库匹配候选人..." });
                navigate(`/recruiting/job/${id}/candidates`);
              }}
            >
              <PlayCircle className="h-4 w-4" />开始智能筛选
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-3">
        {/* 左：JD + 基本信息 */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="p-4">
            <div className="mb-3 text-sm font-medium">岗位基本信息</div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">岗位名称</Label>
                <Input defaultValue="高级前端工程师" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">部门</Label>
                  <Select defaultValue="技术中心">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="技术中心">技术中心</SelectItem>
                      <SelectItem value="运营中心">运营中心</SelectItem>
                      <SelectItem value="职能部门">职能部门</SelectItem>
                      <SelectItem value="生产一线">生产一线</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">工作地点</Label>
                  <Input defaultValue="上海" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">招聘人数</Label>
                  <Input defaultValue="2" type="number" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">薪资范围</Label>
                  <Input defaultValue="25-40K" className="mt-1" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">岗位 JD</div>
              <Button size="sm" variant="ghost" onClick={handleGenerate}>
                <Wand2 className="h-4 w-4 text-[hsl(var(--ai))]" />
                AI 重新生成画像
              </Button>
            </div>
            <Textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="min-h-[280px] text-xs leading-relaxed"
            />
          </Card>
        </div>

        {/* 右：AI 画像 */}
        <div className="space-y-4 lg:col-span-2">
          {!generated ? (
            <Card className="p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ai-soft text-[hsl(var(--ai))]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-medium">AI 尚未生成岗位画像</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                确认左侧 JD 后，点击「AI 生成岗位画像」即可结构化提取筛选规则
              </p>
              <Button className="mt-4" onClick={handleGenerate}>
                <Wand2 className="h-4 w-4" />AI 生成岗位画像
              </Button>
            </Card>
          ) : (
            <>
              {/* AI 摘要 */}
              <div className="ai-card">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--ai))]" />
                  <div>
                    <div className="text-sm font-medium text-[hsl(var(--ai))]">AI 画像摘要</div>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                      该岗位偏向<strong>资深前端 + 技术管理过渡</strong>方向，建议优先考虑大厂背景、
                      有 React 深度实践的候选人。已识别 <strong>4 项硬性要求、4 项加分项、2 项排除项</strong>，
                      推荐权重以「技能匹配」与「工作经验」为主。
                    </p>
                  </div>
                </div>
              </div>

              {/* 三组规则 */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <RuleGroup
                  title="硬性要求"
                  hint="必须满足"
                  tone="success"
                  icon={Check}
                  items={hardReqs}
                  onAdd={() => addItem(setHardReqs, "h")}
                  onChange={(id, t) => updateItem(setHardReqs, id, t)}
                  onRemove={(id) => removeItem(setHardReqs, id)}
                />
                <RuleGroup
                  title="加分项"
                  hint="提升评分"
                  tone="info"
                  icon={Plus}
                  items={bonus}
                  onAdd={() => addItem(setBonus, "b")}
                  onChange={(id, t) => updateItem(setBonus, id, t)}
                  onRemove={(id) => removeItem(setBonus, id)}
                />
                <RuleGroup
                  title="排除项"
                  hint="自动过滤"
                  tone="danger"
                  icon={X}
                  items={excludes}
                  onAdd={() => addItem(setExcludes, "e")}
                  onChange={(id, t) => updateItem(setExcludes, id, t)}
                  onRemove={(id) => removeItem(setExcludes, id)}
                />
              </div>

              {/* 评分维度权重 */}
              <Card className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">匹配评分维度</div>
                    <div className="text-xs text-muted-foreground">
                      调整权重以影响候选人最终得分，总和应为 100
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      totalWeight === 100
                        ? "bg-success-soft text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]"
                        : "bg-warning-soft text-[hsl(var(--warning-foreground))] border-[hsl(var(--warning)/0.4)]"
                    }
                  >
                    {totalWeight === 100 ? <Check className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
                    总权重 {totalWeight}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {dims.map((d, idx) => (
                    <div key={d.key} className="rounded-md border bg-muted/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{d.label}</div>
                            <div className="text-xs text-muted-foreground">{d.desc}</div>
                          </div>
                        </div>
                        <div className="text-base font-semibold tabular-nums text-primary">
                          {d.weight}%
                        </div>
                      </div>
                      <Slider
                        value={[d.weight]}
                        max={100}
                        step={5}
                        className="mt-3"
                        onValueChange={([v]) =>
                          setDims((arr) =>
                            arr.map((x, i) => (i === idx ? { ...x, weight: v } : x)),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* 预估匹配 */}
              <Card className="flex items-center justify-between gap-3 border-primary/30 bg-primary-soft p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">基于当前画像，预计可匹配候选人</div>
                    <div className="text-xs text-muted-foreground">
                      简历库共 86 份，硬性要求过滤后剩 24 份，含加分项 18 份
                    </div>
                  </div>
                </div>
                <Button onClick={() => navigate(`/recruiting/job/${id}/candidates`)}>
                  <PlayCircle className="h-4 w-4" />开始智能筛选
                </Button>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RuleGroup({
  title,
  hint,
  tone,
  icon: Icon,
  items,
  onAdd,
  onChange,
  onRemove,
}: {
  title: string;
  hint: string;
  tone: "success" | "info" | "danger";
  icon: typeof Check;
  items: ProfileItem[];
  onAdd: () => void;
  onChange: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}) {
  const toneMap = {
    success: "bg-success-soft text-[hsl(var(--success))]",
    info: "bg-info-soft text-[hsl(var(--info))]",
    danger: "bg-danger-soft text-[hsl(var(--danger))]",
  };
  return (
    <Card className="flex flex-col p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`flex h-6 w-6 items-center justify-center rounded ${toneMap[tone]}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-sm font-medium">{title}</div>
            <div className="text-[10px] text-muted-foreground">{hint}</div>
          </div>
        </div>
        <Badge variant="secondary" className="text-[11px]">{items.length}</Badge>
      </div>
      <div className="flex-1 space-y-1.5">
        {items.map((it) => (
          <div key={it.id} className="group flex items-center gap-1">
            <Input
              value={it.text}
              onChange={(e) => onChange(it.id, e.target.value)}
              className="h-8 text-xs"
              placeholder="输入规则…"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
              onClick={() => onRemove(it.id)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" />添加
      </Button>
    </Card>
  );
}
