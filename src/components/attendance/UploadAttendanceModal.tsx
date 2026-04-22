/**
 * 生产一线月度考勤表上传 Modal
 * [BACKEND] 校对逻辑由后端完成，当前为 mock
 */
import { useState, useCallback, useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Upload, CloudUpload, FileSpreadsheet, Download, X, ChevronRight,
  Users, Clock, AlertTriangle, CheckCircle2, Eye,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// ─── types ───
interface ComparisonRow {
  id: string;
  name: string;
  dept: string;
  manualAttHours: number;
  dingtalkAttHours: number;
  attDiff: number;
  manualOTHours: number;
  dingtalkOTHours: number;
  otDiff: number;
  status: "一致" | "存在差异" | "仅手工表" | "仅钉钉" | "离职";
  dailyDetail: DailyDetail[];
}

interface DailyDetail {
  day: number;
  manualHours: number;
  dingtalkHours: number;
  diff: number;
}

interface OverviewStats {
  totalPeople: number;
  totalAttHours: number;
  totalOTHours: number;
  anomalyCount: number;
}

// ─── mock ───
const MOCK_NAMES = [
  { name: "吴**", dept: "制造一部" },
  { name: "郑**", dept: "制造一部" },
  { name: "梅**", dept: "制造二部" },
  { name: "甘*", dept: "制造二部" },
  { name: "黄**", dept: "制造一部" },
  { name: "潘**", dept: "制造二部" },
  { name: "罗**", dept: "质检部" },
  { name: "熊**", dept: "制造一部" },
  { name: "吴*", dept: "制造二部" },
  { name: "李*", dept: "质检部" },
  { name: "姚**", dept: "制造一部", resigned: true },
];

function generateMockComparison(): ComparisonRow[] {
  return MOCK_NAMES.map((p, i) => {
    if ((p as any).resigned) {
      return {
        id: `u${i}`,
        name: p.name,
        dept: p.dept,
        manualAttHours: 0,
        dingtalkAttHours: 0,
        attDiff: 0,
        manualOTHours: 0,
        dingtalkOTHours: 0,
        otDiff: 0,
        status: "离职" as const,
        dailyDetail: [],
      };
    }
    const manualAtt = 100 + Math.round(Math.random() * 40);
    const dingtalkAtt = manualAtt + (i % 3 === 0 ? -(1 + Math.round(Math.random() * 4)) : i % 3 === 1 ? Math.round(Math.random() * 2) : 0);
    const manualOT = 4 + Math.round(Math.random() * 6);
    const dingtalkOT = manualOT + (i % 4 === 0 ? -1.5 : 0);
    const attDiff = +(manualAtt - dingtalkAtt).toFixed(1);
    const otDiff = +(manualOT - dingtalkOT).toFixed(1);

    let status: ComparisonRow["status"] = "一致";
    if (Math.abs(attDiff) > 0.5 || Math.abs(otDiff) > 0.5) status = "存在差异";
    if (i === 7) status = "仅手工表";
    if (i === 8) status = "仅钉钉";

    const daily: DailyDetail[] = Array.from({ length: 26 }, (_, d) => {
      const mh = +(5 + Math.random() * 4).toFixed(1);
      const dh = +(mh + (Math.random() > 0.8 ? -(0.5 + Math.random()) : 0)).toFixed(1);
      return { day: d + 1, manualHours: mh, dingtalkHours: dh, diff: +(mh - dh).toFixed(1) };
    });

    return {
      id: `u${i}`, name: p.name, dept: p.dept,
      manualAttHours: manualAtt, dingtalkAttHours: dingtalkAtt, attDiff,
      manualOTHours: manualOT, dingtalkOTHours: dingtalkOT, otDiff,
      status, dailyDetail: daily,
    };
  });
}

// ─── Stepper ───
function Stepper({ step }: { step: number }) {
  const steps = ["选择归属", "上传文件", "识别预览"];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0
              ${done ? "bg-primary text-primary-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {done ? "✓" : idx}
            </div>
            <span className={`text-sm ${active ? "font-medium text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Status Badge ───
const statusStyle: Record<string, string> = {
  "一致": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "存在差异": "bg-amber-50 text-amber-700 border-amber-200",
  "仅手工表": "bg-muted text-muted-foreground",
  "仅钉钉": "bg-muted text-muted-foreground",
  "离职": "bg-muted text-muted-foreground",
};

// ─── Main Component ───
interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UploadAttendanceModal({ open, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [campus, setCampus] = useState("鄂州工厂");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [rows, setRows] = useState<ComparisonRow[]>([]);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [filter, setFilter] = useState<"all" | "anomaly" | "ok">("all");
  const [detailRow, setDetailRow] = useState<ComparisonRow | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep(1);
    setCampus("鄂州工厂");
    setFile(null);
    setUploading(false);
    setUploadProgress(0);
    setRows([]);
    setStats(null);
    setFilter("all");
    setDetailRow(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const f = files[0];
    if (f.size > 10 * 1024 * 1024) { toast.error("文件超过 10MB 限制"); return; }
    if (!/\.(xlsx|xls)$/i.test(f.name)) { toast.error("仅支持 .xlsx / .xls 格式"); return; }
    setFile(f);
  }, []);

  const simulateUpload = async () => {
    setUploading(true);
    setUploadProgress(0);
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(r => setTimeout(r, 200));
      setUploadProgress(i);
    }
    // [BACKEND] 实际场景由后端解析 Excel 并校对钉钉数据
    const mockRows = generateMockComparison();
    const anomalyCount = mockRows.filter(r => r.status === "存在差异").length;
    setStats({
      totalPeople: mockRows.filter(r => r.status !== "离职").length,
      totalAttHours: mockRows.reduce((s, r) => s + r.manualAttHours, 0),
      totalOTHours: mockRows.reduce((s, r) => s + r.manualOTHours, 0),
      anomalyCount,
    });
    setRows(mockRows);
    setUploading(false);
    setStep(3);
  };

  const filteredRows = rows.filter(r => {
    if (filter === "anomaly") return r.status === "存在差异" || r.status === "仅手工表" || r.status === "仅钉钉";
    if (filter === "ok") return r.status === "一致";
    return true;
  });

  const handleImport = (ignoreAnomaly: boolean) => {
    toast.success(`已导入 ${campus} ${month} 考勤数据（${rows.length} 人）${ignoreAnomaly ? "，异常已忽略" : ""}`);
    handleClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">上传生产一线月度考勤表</DialogTitle>
            <DialogDescription>导入车间手工统计 Excel，系统自动与钉钉打卡数据校对</DialogDescription>
          </DialogHeader>

          <Stepper step={step} />

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">所属厂区</label>
                  <Select value={campus} onValueChange={setCampus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="鄂州工厂">鄂州工厂</SelectItem>
                      <SelectItem value="武汉总部">武汉总部</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">统计月份</label>
                  <input type="month" value={month} onChange={e => setMonth(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                ℹ️ 数据来源：车间主管手工填报的月度工时表
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)}>下一步</Button>
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-4">
              {!file ? (
                <div
                  className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files); }}
                >
                  <CloudUpload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">拖拽文件到此处，或点击选择</p>
                  <p className="text-xs text-muted-foreground mt-1">支持 .xlsx / .xls，最大 10MB</p>
                  <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
                    onChange={e => handleFileSelect(e.target.files)} />
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
                  <FileSpreadsheet className="h-8 w-8 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                    {uploading && <Progress value={uploadProgress} className="mt-2 h-1.5" />}
                  </div>
                  {!uploading && (
                    <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              <a href="#" onClick={e => { e.preventDefault(); toast.info("模板下载功能将在后端接入后启用"); }}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <Download className="h-3.5 w-3.5" />下载标准模板（表头需含：人员、1-31 日每日工时、出勤工时、加班工时）
              </a>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>← 上一步</Button>
                <Button onClick={simulateUpload} disabled={!file || uploading}>
                  {uploading ? "解析中..." : "上传并解析"}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && stats && (
            <div className="space-y-4">
              {/* overview cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Users, label: "识别人数", value: `${stats.totalPeople} 人`, color: "text-primary" },
                  { icon: Clock, label: "出勤工时合计", value: `${stats.totalAttHours} h`, color: "text-foreground" },
                  { icon: Clock, label: "加班工时合计", value: `${stats.totalOTHours} h`, color: "text-foreground" },
                  { icon: AlertTriangle, label: "异常记录", value: `${stats.anomalyCount} 条`, color: "text-destructive" },
                ].map(c => (
                  <div key={c.label} className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <c.icon className={`h-4 w-4 ${c.color}`} />
                      <span className="text-xs text-muted-foreground">{c.label}</span>
                    </div>
                    <p className={`text-lg font-semibold ${c.color}`}>{c.value}</p>
                  </div>
                ))}
              </div>

              {/* filter */}
              <div className="flex gap-2">
                {([["all", "全部"], ["anomaly", "仅看异常"], ["ok", "仅看一致"]] as const).map(([k, l]) => (
                  <button key={k} onClick={() => setFilter(k)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${filter === k ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"}`}>
                    {l}
                  </button>
                ))}
              </div>

              {/* table */}
              <div className="rounded-xl border bg-card overflow-auto max-h-[340px]">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-4">人员</TableHead>
                      <TableHead>部门</TableHead>
                      <TableHead className="text-right">统计出勤(h)</TableHead>
                      <TableHead className="text-right">钉钉出勤(h)</TableHead>
                      <TableHead className="text-right">差异(h)</TableHead>
                      <TableHead className="text-right">统计加班(h)</TableHead>
                      <TableHead className="text-right">钉钉加班(h)</TableHead>
                      <TableHead className="text-right">差异(h)</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map(r => (
                      <TableRow key={r.id} className={r.status === "存在差异" ? "bg-amber-50/50" : ""}>
                        <TableCell className="pl-4 font-medium text-sm">{r.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.dept}</TableCell>
                        <TableCell className="text-right text-sm">{r.manualAttHours || "—"}</TableCell>
                        <TableCell className="text-right text-sm">{r.dingtalkAttHours || "—"}</TableCell>
                        <TableCell className={`text-right text-sm font-medium ${Math.abs(r.attDiff) > 0.5 ? "text-destructive" : ""}`}>
                          {r.attDiff !== 0 ? (r.attDiff > 0 ? `+${r.attDiff}` : r.attDiff) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm">{r.manualOTHours || "—"}</TableCell>
                        <TableCell className="text-right text-sm">{r.dingtalkOTHours || "—"}</TableCell>
                        <TableCell className={`text-right text-sm font-medium ${Math.abs(r.otDiff) > 0.5 ? "text-destructive" : ""}`}>
                          {r.otDiff !== 0 ? (r.otDiff > 0 ? `+${r.otDiff}` : r.otDiff) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${statusStyle[r.status] || ""}`}>{r.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {r.status !== "离职" && (
                            <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary"
                              onClick={() => setDetailRow(r)}>
                              <Eye className="h-3.5 w-3.5" />查看详情
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* actions */}
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => { setStep(2); setRows([]); setStats(null); }}>← 上一步</Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleClose}>取消</Button>
                  {stats.anomalyCount > 0 && (
                    <Button variant="outline" onClick={() => handleImport(true)}>忽略异常并导入</Button>
                  )}
                  <Button onClick={() => handleImport(false)}>确认导入</Button>
                </div>
              </div>
            </div>
          )}

          {/* empty state for step 3 when no data yet */}
          {step === 3 && !stats && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileSpreadsheet className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">上传文件后自动识别并校对</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Detail Drawer ── */}
      <Sheet open={!!detailRow} onOpenChange={v => { if (!v) setDetailRow(null); }}>
        <SheetContent className="w-[560px] sm:max-w-[560px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detailRow?.name} · 每日工时对比</SheetTitle>
          </SheetHeader>
          {detailRow && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-3 text-sm">
                <Badge variant="outline">部门：{detailRow.dept}</Badge>
                <Badge variant="outline">厂区：{campus}</Badge>
                <Badge variant="outline">月份：{month}</Badge>
              </div>
              <div className="rounded-xl border bg-card overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-4">日期</TableHead>
                      <TableHead className="text-right">手工工时(h)</TableHead>
                      <TableHead className="text-right">钉钉工时(h)</TableHead>
                      <TableHead className="text-right">差异(h)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailRow.dailyDetail.map(d => (
                      <TableRow key={d.day} className={Math.abs(d.diff) > 0.5 ? "bg-amber-50/50" : ""}>
                        <TableCell className="pl-4 text-sm">{month}-{String(d.day).padStart(2, "0")}</TableCell>
                        <TableCell className="text-right text-sm">{d.manualHours}</TableCell>
                        <TableCell className="text-right text-sm">{d.dingtalkHours}</TableCell>
                        <TableCell className={`text-right text-sm font-medium ${Math.abs(d.diff) > 0.5 ? "text-destructive" : ""}`}>
                          {d.diff !== 0 ? (d.diff > 0 ? `+${d.diff}` : d.diff) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                合计差异：出勤 <span className={Math.abs(detailRow.attDiff) > 0.5 ? "text-destructive font-medium" : ""}>
                  {detailRow.attDiff > 0 ? `+${detailRow.attDiff}` : detailRow.attDiff}h
                </span> · 加班 <span className={Math.abs(detailRow.otDiff) > 0.5 ? "text-destructive font-medium" : ""}>
                  {detailRow.otDiff > 0 ? `+${detailRow.otDiff}` : detailRow.otDiff}h
                </span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
