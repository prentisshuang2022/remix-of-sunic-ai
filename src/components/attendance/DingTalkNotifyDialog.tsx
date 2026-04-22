/**
 * 交互 C：一键钉钉通知弹窗
 * [BACKEND] 通知发送由后端 API 完成
 */
import { useState } from "react";
import { Send, Sparkles, Info } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  supervisorName: string;
  dingId: string;
  anomalyDate?: string;
  anomalyType?: string;
  evidence?: string;
  hasAccessEvidence?: boolean;
  defaultContent?: string;
  onSent?: () => void;
}

const notifyTypes = [
  "请员工补卡",
  "请员工提交请假单",
  "请员工申请调休",
  "请员工说明异常情况",
  "请上级核定加班",
  "自定义内容",
];

function generateContent(employeeName: string, anomalyDate: string, anomalyType: string, evidence: string): string {
  let msg = `【考勤提醒】${employeeName}，您 ${anomalyDate} 存在${anomalyType}记录。`;
  if (evidence) {
    msg += `\n系统在门禁查到您${evidence}，疑似漏打卡。`;
  }
  msg += `\n请您在钉钉内发起相关申请，附上相关说明。\n如有疑问请联系 HR。`;
  return msg;
}

export default function DingTalkNotifyDialog({
  open, onOpenChange, employeeName, supervisorName, dingId,
  anomalyDate = "4月14日", anomalyType = "迟到", evidence = "",
  hasAccessEvidence = false, defaultContent, onSent,
}: Props) {
  const [recipient, setRecipient] = useState("employee");
  const [notifyType, setNotifyType] = useState("请员工补卡");
  const [content, setContent] = useState(
    defaultContent || generateContent(employeeName, anomalyDate, anomalyType, evidence)
  );
  const [attachEvidence, setAttachEvidence] = useState(hasAccessEvidence);
  const [smsRemind, setSmsRemind] = useState(false);
  const [ccHrEmail, setCcHrEmail] = useState(false);
  const [sendTiming, setSendTiming] = useState("now");
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onOpenChange(false);
      toast.success(`钉钉通知已发送给${employeeName}`);
      onSent?.();
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">发送钉钉通知</DialogTitle>
          <DialogDescription>本系统仅发送提醒，具体处理请员工在钉钉内完成</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 接收人 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">接收人</Label>
            <RadioGroup value={recipient} onValueChange={setRecipient} className="space-y-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="employee" id="r-emp" />
                <Label htmlFor="r-emp" className="text-sm font-normal">员工本人：{employeeName}（{dingId}）</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="supervisor" id="r-sup" />
                <Label htmlFor="r-sup" className="text-sm font-normal">直属上级：{supervisorName}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="both" id="r-both" />
                <Label htmlFor="r-both" className="text-sm font-normal">员工本人 + 直属上级抄送</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 通知类型 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">通知类型</Label>
            <Select value={notifyType} onValueChange={setNotifyType}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {notifyTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* 通知内容 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">通知内容预览</Label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              className="text-sm resize-none"
            />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-violet-500" />
              <span>由 AI 根据异常类型和门禁证据自动生成，可自由修改</span>
            </div>
          </div>

          {/* 附加证据 */}
          {hasAccessEvidence && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="attach-ev"
                  checked={attachEvidence}
                  onCheckedChange={(v) => setAttachEvidence(!!v)}
                />
                <Label htmlFor="attach-ev" className="text-sm font-normal">随通知附带门禁对照截图（推荐）</Label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">附证据可显著提升员工响应率（据数据平均快 2.4 倍）</p>
            </div>
          )}

          {/* 发送渠道 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">发送渠道</Label>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Checkbox checked disabled id="ch-ding" />
                <Label htmlFor="ch-ding" className="text-sm font-normal text-muted-foreground">钉钉工作通知（必选）</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="ch-sms" checked={smsRemind} onCheckedChange={(v) => setSmsRemind(!!v)} />
                <Label htmlFor="ch-sms" className="text-sm font-normal">短信提醒</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="ch-email" checked={ccHrEmail} onCheckedChange={(v) => setCcHrEmail(!!v)} />
                <Label htmlFor="ch-email" className="text-sm font-normal">同步抄送 HR 邮箱存档</Label>
              </div>
            </div>
          </div>

          {/* 发送时机 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">发送时机</Label>
            <RadioGroup value={sendTiming} onValueChange={setSendTiming} className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="now" id="t-now" />
                <Label htmlFor="t-now" className="text-sm font-normal">立即发送</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="scheduled" id="t-sched" />
                <Label htmlFor="t-sched" className="text-sm font-normal">定时发送</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="flex-col gap-3">
          <div className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground flex items-start gap-1.5 w-full">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>钉钉通知发送后，员工的处理动作（补卡、请假申请等）将在钉钉内完成，本系统仅负责识别与提醒，不参与审批流程。</span>
          </div>
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button onClick={handleSend} disabled={sending} className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              {sending ? "发送中..." : "确认发送"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
