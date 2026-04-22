/**
 * 交互 D：调休余额管理抽屉
 * [BACKEND] 调休余额和台账由后端 API 提供
 */
import { useState, useMemo } from "react";
import { Download, Send, Bell, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { dayoffRows, heatmapEmployees } from "@/mocks/attendance";
import DingTalkNotifyDialog from "./DingTalkNotifyDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LedgerRow {
  id: string;
  name: string;
  campus: string;
  position: string;
  totalHours: number;
  usedHours: number;
  remainHours: number;
  pendingApply: number;
  expiringSoon: number;
  lastUsed: string;
}

function buildLedger(): LedgerRow[] {
  return dayoffRows.map(d => {
    const emp = heatmapEmployees.find(e => e.name === d.name);
    const pendingApply = Math.max(0, d.remainHours - Math.floor(Math.random() * 8));
    const expiringSoon = Math.random() > 0.6 ? Math.floor(Math.random() * 8) + 2 : 0;
    return {
      id: d.id,
      name: d.name,
      campus: emp?.campus || "武汉总部",
      position: emp?.positionType || "行政岗",
      totalHours: d.totalHours,
      usedHours: d.usedHours,
      remainHours: d.remainHours,
      pendingApply,
      expiringSoon,
      lastUsed: d.lastUsedDate,
    };
  });
}

export default function LeaveBalanceDrawer({ open, onOpenChange }: Props) {
  const ledger = useMemo(buildLedger, []);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [campusFilter, setCampusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("balance-desc");
  const [smartOpen, setSmartOpen] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState<LedgerRow | null>(null);

  const totalAvail = ledger.reduce((s, r) => s + r.remainHours, 0);
  const totalUsedMonth = ledger.reduce((s, r) => s + r.usedHours, 0);
  const totalPending = ledger.reduce((s, r) => s + r.pendingApply, 0);
  const totalExpiring = ledger.reduce((s, r) => s + r.expiringSoon, 0);

  const filtered = useMemo(() => {
    let rows = ledger;
    if (campusFilter !== "all") rows = rows.filter(r => r.campus === campusFilter);
    if (sortBy === "balance-desc") rows = [...rows].sort((a, b) => b.remainHours - a.remainHours);
    else if (sortBy === "pending-desc") rows = [...rows].sort((a, b) => b.pendingApply - a.pendingApply);
    return rows;
  }, [ledger, campusFilter, sortBy]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectedRows = filtered.filter(r => selected.has(r.id));
  const selectedPendingTotal = selectedRows.reduce((s, r) => s + r.pendingApply, 0);

  const smartReminders = [
    { icon: "⚠️", text: "赵六有 8h 调休将在 15 天内过期", action: "一键通知员工", target: "赵六" },
    { icon: "ℹ️", text: "孙七、吴九已累计 20h+ 可调休未申请", action: "一键批量通知", target: "孙七" },
    { icon: "ℹ️", text: "本月生产岗加班同比上升 35%", action: "查看加班趋势", target: null },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[720px] sm:max-w-[720px] overflow-y-auto p-6">
          <SheetHeader className="mb-4">
            <SheetTitle>调休余额管理</SheetTitle>
            <SheetDescription>查看、汇总、通知，不处理审批</SheetDescription>
          </SheetHeader>

          {/* KPI */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "全员累计可调休", value: `${totalAvail}h`, color: "" },
              { label: "本月已使用", value: `${totalUsedMonth}h`, color: "" },
              { label: "待员工申请", value: `${totalPending}h`, color: "text-orange-600", pulse: true },
              { label: "即将过期", value: `${totalExpiring}h`, color: "text-red-600" },
            ].map(k => (
              <div key={k.label} className="rounded-lg border bg-card p-3 text-center">
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className={cn("mt-1 text-lg font-semibold", k.color)}>
                  {k.value}
                  {k.pulse && <span className="inline-block ml-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <Select value={campusFilter} onValueChange={setCampusFilter}>
                <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="全部厂区" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部厂区</SelectItem>
                  <SelectItem value="武汉总部">武汉总部</SelectItem>
                  <SelectItem value="鄂州工厂">鄂州工厂</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="balance-desc">余额降序</SelectItem>
                  <SelectItem value="pending-desc">待申请降序</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" />导出调休台账
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden mb-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-8 text-xs"><Checkbox /></TableHead>
                  <TableHead className="text-xs">员工</TableHead>
                  <TableHead className="text-xs">厂区·岗位</TableHead>
                  <TableHead className="text-xs text-right">累计获得</TableHead>
                  <TableHead className="text-xs text-right">已使用</TableHead>
                  <TableHead className="text-xs text-right">当前余额</TableHead>
                  <TableHead className="text-xs text-right">待申请</TableHead>
                  <TableHead className="text-xs text-right">即将过期</TableHead>
                  <TableHead className="text-xs">最近使用</TableHead>
                  <TableHead className="text-xs">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(row => (
                  <TableRow key={row.id} className="text-xs">
                    <TableCell>
                      <Checkbox
                        checked={selected.has(row.id)}
                        onCheckedChange={() => toggleSelect(row.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.campus} · {row.position}</TableCell>
                    <TableCell className="text-right">{row.totalHours}h</TableCell>
                    <TableCell className="text-right">{row.usedHours}h</TableCell>
                    <TableCell className="text-right font-medium">{row.remainHours}h</TableCell>
                    <TableCell className="text-right">
                      {row.pendingApply > 0 ? (
                        <span className="text-orange-600 font-medium">{row.pendingApply}h</span>
                      ) : "0h"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.expiringSoon > 0 ? (
                        <span className="text-red-600">{row.expiringSoon}h</span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.lastUsed}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] gap-1"
                        disabled={row.pendingApply === 0}
                        onClick={() => setNotifyTarget(row)}
                      >
                        <Send className="h-3 w-3" />通知申请
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Batch actions */}
          {selected.size > 0 && (
            <div className="rounded-lg border bg-primary/5 px-4 py-3 flex items-center justify-between mb-4 animate-in slide-in-from-bottom-2">
              <span className="text-sm">已选 {selected.size} 名员工 · 合计待申请 {selectedPendingTotal}h</span>
              <div className="flex gap-2">
                <Button size="sm" className="h-8 text-xs gap-1.5">
                  <Send className="h-3.5 w-3.5" />批量通知申请调休
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">导出选中台账</Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelected(new Set())}>取消选择</Button>
              </div>
            </div>
          )}

          {/* Smart reminders */}
          <Collapsible open={smartOpen} onOpenChange={setSmartOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium w-full py-2">
              <Bell className="h-4 w-4 text-primary" />
              智能提醒（{smartReminders.length} 条）
              {smartOpen ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {smartReminders.map((r, i) => (
                <div key={i} className="rounded-lg border bg-card p-3 flex items-center justify-between">
                  <span className="text-sm">{r.icon} {r.text}</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    {r.target ? <><Send className="h-3 w-3" />{r.action}</> : <><ArrowRight className="h-3 w-3" />{r.action}</>}
                  </Button>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </SheetContent>
      </Sheet>

      {notifyTarget && (
        <DingTalkNotifyDialog
          open={!!notifyTarget}
          onOpenChange={(v) => !v && setNotifyTarget(null)}
          employeeName={notifyTarget.name}
          supervisorName="上级"
          dingId=""
          anomalyType="调休"
          defaultContent={`【调休提醒】${notifyTarget.name}，您当前有 ${notifyTarget.pendingApply}h 可申请调休余额，请在钉钉内发起调休申请。`}
          onSent={() => setNotifyTarget(null)}
        />
      )}
    </>
  );
}
