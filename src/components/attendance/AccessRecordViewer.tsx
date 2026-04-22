/**
 * 交互 E：门禁记录查看 Popover / Dialog
 * [BACKEND] 门禁数据由后端门禁系统 API 提供
 */
import { useState } from "react";
import { DoorOpen, Smartphone, Sparkles, Download, Copy, Send } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AccessRecord, DayCell } from "@/mocks/attendance";
import DingTalkNotifyDialog from "./DingTalkNotifyDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  campus: string;
  day: DayCell;
  accessCardNo: string;
  supervisor: string;
  dingId: string;
}

export default function AccessRecordViewer({
  open, onOpenChange, employeeName, campus, day, accessCardNo, supervisor, dingId,
}: Props) {
  const [showNotify, setShowNotify] = useState(false);

  const accessRecords = day.accessRecords || [];
  const firstEntry = accessRecords.find(r => r.direction === "入厂" || r.direction === "入门");
  const hasClockLateButGateEarly = day.status === "late" && firstEntry && day.clockIn && firstEntry.time < day.clockIn;
  const timeDiffMinutes = hasClockLateButGateEarly && day.clockIn ? (() => {
    const [ah, am] = firstEntry!.time.split(":").map(Number);
    const [bh, bm] = day.clockIn!.split(":").map(Number);
    return (bh * 60 + bm) - (ah * 60 + am);
  })() : 0;

  const aiAnalysis = hasClockLateButGateEarly
    ? `AI 分析：员工实际 ${firstEntry!.time} 已到${campus === "鄂州工厂" ? "厂" : "楼"}（门禁入门），但 ${day.clockIn} 才完成钉钉打卡，疑似忘记打卡 ${timeDiffMinutes} 分钟。建议：通知员工补卡 + 附门禁记录截图作为证据。`
    : day.status === "overtime" && accessRecords.length > 0
      ? `AI 分析：门禁显示员工实际在岗时长长于打卡记录，可作为加班时长佐证。`
      : `AI 分析：当日门禁与打卡记录一致，未发现异常差异。`;

  const handleCopy = () => {
    const text = [
      `门禁记录 · ${employeeName} · 2026年4月${String(day.day).padStart(2, "0")}日`,
      `\n📱 钉钉打卡：`,
      day.clockIn ? `  ${day.clockIn} 上班打卡` : "  无上班打卡",
      day.clockOut ? `  ${day.clockOut} 下班打卡` : "  无下班打卡",
      `\n🚪 门禁记录：`,
      ...accessRecords.map(r => `  ${r.time} ${r.direction}（${r.gate}${r.cardNo ? ` · ${r.cardNo}` : ""}）`),
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <DoorOpen className="h-4 w-4" />
              门禁记录 · {employeeName} · 2026年4月{String(day.day).padStart(2, "0")}日
            </DialogTitle>
            <DialogDescription>来源：{campus}门禁系统 · 数据更新于 15 分钟前</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 钉钉打卡记录 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Smartphone className="h-4 w-4 text-primary" />
                钉钉打卡记录（当日 {[day.clockIn, day.clockOut].filter(t => t && t !== "—").length} 条）
              </div>
              <div className="rounded-lg border bg-card p-3 space-y-2">
                {day.clockIn && day.clockIn !== "—" && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{day.clockIn}</span>
                    <span>上班打卡（GPS：{campus}）</span>
                    {day.anomalyMinutes ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                        ⚠️ 迟到 {day.anomalyMinutes} 分钟
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">✓ 正常</Badge>
                    )}
                  </div>
                )}
                {day.clockOut && day.clockOut !== "—" && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{day.clockOut}</span>
                    <span>下班打卡（GPS：{campus}）</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">✓ 正常</Badge>
                  </div>
                )}
                {(!day.clockIn || day.clockIn === "—") && (!day.clockOut || day.clockOut === "—") && (
                  <p className="text-sm text-muted-foreground">无打卡记录</p>
                )}
              </div>
            </div>

            {/* 门禁记录 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DoorOpen className="h-4 w-4 text-sky-500" />
                门禁记录（当日 {accessRecords.length} 条）
              </div>
              <div className="rounded-lg border bg-card p-3 space-y-2">
                {accessRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground">无门禁记录</p>
                ) : (
                  accessRecords.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={cn(
                        "font-mono text-xs px-1.5 py-0.5 rounded",
                        hasClockLateButGateEarly && i === 0 ? "bg-sky-100 text-sky-700" : "bg-muted"
                      )}>
                        {r.time}
                      </span>
                      <span>{r.gate}{r.direction}（{r.method}{r.cardNo ? ` ${r.cardNo}` : ""}）</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI 差异分析 */}
            <div className="rounded-lg p-3 space-y-1" style={{ backgroundColor: "hsl(var(--primary) / 0.06)" }}>
              <div className="flex items-start gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <p className="text-sm text-violet-700">{aiAnalysis}</p>
              </div>
            </div>

            {/* 操作栏 */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" />下载证据截图
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" />复制到剪贴板
                </Button>
              </div>
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowNotify(true)}>
                <Send className="h-3.5 w-3.5" />一键通知员工补卡（附证据）
              </Button>
            </div>

            {/* 底部说明 */}
            <p className="text-xs text-muted-foreground text-center">
              门禁数据每 15 分钟同步一次 · 仅保留最近 90 天记录 · 数据源受厂区权限管控
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <DingTalkNotifyDialog
        open={showNotify}
        onOpenChange={setShowNotify}
        employeeName={employeeName}
        supervisorName={supervisor}
        dingId={dingId}
        anomalyDate={`4月${String(day.day).padStart(2, "0")}日`}
        anomalyType={day.status === "late" ? "迟到" : "异常"}
        evidence={firstEntry ? `${firstEntry.time} 有${firstEntry.direction}记录` : ""}
        hasAccessEvidence={hasClockLateButGateEarly || false}
      />
    </>
  );
}
