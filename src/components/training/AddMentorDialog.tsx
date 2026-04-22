import { useState } from "react";
import { Sparkles, Zap, Sun, Shield, Globe, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type Craft = "laser" | "solar" | "qa" | "trade";
export type Site = "黄龙山基地" | "鄂州基地" | "光谷研发中心" | "深圳分公司";
export type Level = "金牌" | "资深" | "认证";

export interface NewMentorPayload {
  name: string;
  title: string;
  dept: string;
  site: Site;
  level: Level;
  years: number;
  capacity: number;
  crafts: Craft[];
  tags: string[];
}

const CRAFTS: { key: Craft; icon: typeof Zap; label: string; cls: string }[] = [
  { key: "laser", icon: Zap, label: "激光工艺", cls: "data-[on=true]:bg-primary/10 data-[on=true]:text-primary data-[on=true]:border-primary" },
  { key: "solar", icon: Sun, label: "太阳能装配", cls: "data-[on=true]:bg-warning/15 data-[on=true]:text-warning data-[on=true]:border-warning" },
  { key: "qa", icon: Shield, label: "质量体系", cls: "data-[on=true]:bg-success/15 data-[on=true]:text-success data-[on=true]:border-success" },
  { key: "trade", icon: Globe, label: "外贸销售", cls: "data-[on=true]:bg-[hsl(var(--ai-soft))] data-[on=true]:text-[hsl(var(--ai))] data-[on=true]:border-[hsl(var(--ai))]" },
];

const SITES: Site[] = ["黄龙山基地", "鄂州基地", "光谷研发中心", "深圳分公司"];
const LEVELS: Level[] = ["认证", "资深", "金牌"];

const SUGGEST_TAGS: Record<Craft, string[]> = {
  laser: ["划片机参数", "光路调整", "异常处置", "激光打标", "镜片维护"],
  solar: ["串焊工艺", "EL 检测", "层压工艺", "节拍优化", "组件装配"],
  qa: ["ISO9001", "3A 认证", "内审员", "来料检验", "客诉分析"],
  trade: ["报价规则", "信用证", "海运谈判", "DDP", "欧盟法规"],
};

export function AddMentorDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (m: NewMentorPayload) => void;
}) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState("");
  const [site, setSite] = useState<Site>("黄龙山基地");
  const [level, setLevel] = useState<Level>("认证");
  const [years, setYears] = useState(5);
  const [capacity, setCapacity] = useState(3);
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const reset = () => {
    setName(""); setTitle(""); setDept("");
    setSite("黄龙山基地"); setLevel("认证");
    setYears(5); setCapacity(3);
    setCrafts([]); setTags([]); setTagInput("");
  };

  const toggleCraft = (c: Craft) => {
    setCrafts((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const addTag = (t: string) => {
    const v = t.trim();
    if (!v || tags.includes(v)) return;
    setTags([...tags, v]);
    setTagInput("");
  };

  const aiFill = () => {
    setTitle("激光工艺工程师");
    setDept("生产管理部 / 激光组");
    setSite("黄龙山基地");
    setLevel("资深");
    setYears(8);
    setCapacity(3);
    setCrafts(["laser"]);
    setTags(["划片机参数", "光路调整"]);
    toast.success("AI 已根据岗位档案预填资料，可继续微调");
  };

  const submit = () => {
    if (!name.trim()) { toast.error("请填写姓名"); return; }
    if (!title.trim()) { toast.error("请填写岗位"); return; }
    if (crafts.length === 0) { toast.error("请至少选择一项覆盖工艺"); return; }
    onSubmit({
      name: name.trim(), title: title.trim(),
      dept: dept.trim() || "—",
      site, level, years, capacity, crafts, tags,
    });
    reset();
    onClose();
  };

  const suggestPool = crafts.flatMap((c) => SUGGEST_TAGS[c]).filter((t) => !tags.includes(t));

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">新增导师</DialogTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={aiFill}>
              <Sparkles className="h-3.5 w-3.5 mr-1 text-[hsl(var(--ai))]" />AI 预填
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="姓名" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如 陈志强" />
            </Field>
            <Field label="岗位" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如 激光工艺工程师" />
            </Field>
            <Field label="所属部门">
              <Input value={dept} onChange={(e) => setDept(e.target.value)} placeholder="如 生产管理部 / 激光组" />
            </Field>
            <Field label="所在厂区">
              <Select value={site} onValueChange={(v) => setSite(v as Site)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SITES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* 等级 */}
          <Field label="导师等级">
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-md border text-xs transition-colors",
                    level === l
                      ? l === "金牌" ? "bg-warning/15 text-warning border-warning"
                        : l === "资深" ? "bg-primary/10 text-primary border-primary"
                        : "bg-muted text-foreground border-foreground/40"
                      : "bg-background hover:border-primary/40 text-muted-foreground"
                  )}
                >
                  {l}导师
                  <div className="text-[10px] opacity-70 mt-0.5">
                    {l === "金牌" ? "≥10 年 · 累计出师 20+" : l === "资深" ? "≥5 年 · 累计出师 10+" : "已认证 · 可独立带教"}
                  </div>
                </button>
              ))}
            </div>
          </Field>

          {/* 年限 + 容量 */}
          <div className="grid grid-cols-2 gap-6">
            <Field label={`从业年限 · ${years} 年`}>
              <Slider value={[years]} onValueChange={(v) => setYears(v[0])} min={1} max={20} step={1} />
            </Field>
            <Field label={`带教容量 · ${capacity} 人`}>
              <Slider value={[capacity]} onValueChange={(v) => setCapacity(v[0])} min={1} max={6} step={1} />
            </Field>
          </div>

          {/* 覆盖工艺 */}
          <Field label="覆盖工艺" required hint="可多选，决定可指派的学徒类型">
            <div className="grid grid-cols-2 gap-2">
              {CRAFTS.map((c) => {
                const Icon = c.icon;
                const on = crafts.includes(c.key);
                return (
                  <button
                    key={c.key}
                    type="button"
                    data-on={on}
                    onClick={() => toggleCraft(c.key)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md border text-xs transition-colors",
                      "bg-background hover:border-primary/40 text-muted-foreground",
                      c.cls
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="font-medium">{c.label}</span>
                    {on && <span className="ml-auto text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* 专长标签 */}
          <Field label="专长标签" hint="回车添加，最多 6 个">
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
              {tags.map((t) => (
                <Badge key={t} variant="outline" className="font-normal text-[11px] gap-1 pr-1">
                  {t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {tags.length === 0 && <span className="text-[11px] text-muted-foreground">尚未添加</span>}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); if (tags.length < 6) addTag(tagInput); }
              }}
              placeholder="输入后回车，例：划片机参数"
              disabled={tags.length >= 6}
            />
            {suggestPool.length > 0 && tags.length < 6 && (
              <div className="mt-2">
                <div className="text-[10px] text-muted-foreground mb-1 font-mono">推荐标签</div>
                <div className="flex flex-wrap gap-1">
                  {suggestPool.slice(0, 8).map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="cursor-pointer font-normal text-[10px] hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => addTag(t)}
                    >
                      + {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Field>
        </div>

        <DialogFooter className="px-6 py-3 border-t bg-muted/30">
          <Button variant="ghost" size="sm" onClick={() => { reset(); onClose(); }}>取消</Button>
          <Button size="sm" onClick={submit}>
            <Sparkles className="h-3.5 w-3.5 mr-1" />提交认证
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
        {hint && <span className="text-[10px] text-muted-foreground font-normal ml-1">· {hint}</span>}
      </Label>
      {children}
    </div>
  );
}
