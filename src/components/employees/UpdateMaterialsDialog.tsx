import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileText,
  CheckCircle2,
  X,
  Paperclip,
  AlertTriangle,
  Sparkles,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface UpdateTarget {
  id: string;
  name: string;
  department: string;
  position: string;
  contractEnd?: string;
  contractStatus?: "normal" | "soon" | "expired";
  idEnd?: string;
  idStatus?: "normal" | "soon" | "expired";
}

interface RequiredItem {
  key: string;
  label: string;
  desc: string;
  required: boolean;
}

interface UploadedFile {
  itemKey: string;
  name: string;
  size: number;
  status: "uploading" | "done" | "ai";
  aiResult?: string;
}

export function UpdateMaterialsDialog({
  target,
  open,
  onClose,
}: {
  target: UpdateTarget | null;
  open: boolean;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [note, setNote] = useState("");
  const [dragKey, setDragKey] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!target) return null;

  const items: RequiredItem[] = [];
  if (target.contractStatus && target.contractStatus !== "normal") {
    items.push({
      key: "contract",
      label: "新版劳动合同扫描件",
      desc: "请上传双方已签字盖章的新合同 PDF / 图片",
      required: true,
    });
  }
  if (target.idStatus && target.idStatus !== "normal") {
    items.push({
      key: "id_front",
      label: "新身份证 · 正面",
      desc: "国徽面，确保四角完整、无反光",
      required: true,
    });
    items.push({
      key: "id_back",
      label: "新身份证 · 反面",
      desc: "人像面，姓名 / 号码 / 有效期清晰可见",
      required: true,
    });
  }
  items.push({
    key: "other",
    label: "其他补充材料",
    desc: "如学历变更、婚育情况变更等（可选）",
    required: false,
  });

  const handleFiles = (itemKey: string, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
      itemKey,
      name: f.name,
      size: f.size,
      status: "uploading",
    }));
    setFiles((prev) => [...prev, ...newFiles]);

    // 模拟上传 + AI 识别
    newFiles.forEach((nf, idx) => {
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((p) =>
            p.name === nf.name && p.itemKey === nf.itemKey && p.status === "uploading"
              ? { ...p, status: "done" }
              : p
          )
        );
        if (itemKey === "id_front" || itemKey === "id_back" || itemKey === "contract") {
          setTimeout(() => {
            setFiles((prev) =>
              prev.map((p) =>
                p.name === nf.name && p.itemKey === nf.itemKey
                  ? {
                      ...p,
                      status: "ai",
                      aiResult:
                        itemKey === "contract"
                          ? "已识别合同期限：2026-05-20 至 2029-05-19"
                          : itemKey === "id_front"
                          ? "已识别有效期：2025-12-16 至 2035-12-15"
                          : "已识别身份证号、住址、签发机关",
                    }
                  : p
              )
            );
          }, 600 + idx * 200);
        }
      }, 700 + idx * 250);
    });
  };

  const removeFile = (name: string, itemKey: string) => {
    setFiles((prev) => prev.filter((f) => !(f.name === name && f.itemKey === itemKey)));
  };

  const requiredDone = items
    .filter((i) => i.required)
    .every((i) => files.some((f) => f.itemKey === i.key && f.status !== "uploading"));

  const handleSubmit = () => {
    if (!requiredDone) {
      toast.error("请先上传所有必传材料");
      return;
    }
    toast.success(`${target.name} 的资料已提交，HR 审核后将自动写入档案`);
    setFiles([]);
    setNote("");
    onClose();
  };

  const handleClose = () => {
    setFiles([]);
    setNote("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-primary" />
            {target.name} · 资料更新
          </DialogTitle>
          <DialogDescription>
            {target.department} · {target.position} · 上传后系统将通过 AI 识别并自动更新对应字段
          </DialogDescription>
        </DialogHeader>

        {/* 提醒原因 */}
        <div className="rounded-md border border-warning/30 bg-warning/5 p-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-warning">
            <AlertTriangle className="h-4 w-4" />
            需更新原因
          </div>
          {target.contractStatus && target.contractStatus !== "normal" && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <CircleDot className="h-3 w-3" />
              劳动合同{target.contractStatus === "expired" ? "已到期" : "即将到期"}（{target.contractEnd}），需上传新合同
            </div>
          )}
          {target.idStatus && target.idStatus !== "normal" && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <CircleDot className="h-3 w-3" />
              身份证{target.idStatus === "expired" ? "已到期" : "即将到期"}（{target.idEnd}），需上传换发后的身份证
            </div>
          )}
        </div>

        {/* 上传清单 */}
        <div className="space-y-3">
          {items.map((item) => {
            const itemFiles = files.filter((f) => f.itemKey === item.key);
            const hasFile = itemFiles.length > 0;
            return (
              <div
                key={item.key}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  dragKey === item.key && "border-primary bg-primary/5",
                  hasFile && itemFiles.some((f) => f.status !== "uploading") && "border-success/40 bg-success/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium flex items-center gap-1.5">
                      {item.label}
                      {item.required && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] px-1.5 py-0">必传</Badge>}
                      {hasFile && itemFiles.some((f) => f.status !== "uploading") && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => inputRefs.current[item.key]?.click()}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1" />选择文件
                  </Button>
                  <input
                    ref={(el) => (inputRefs.current[item.key] = el)}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleFiles(item.key, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                {/* 拖放区 */}
                {!hasFile && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragKey(item.key);
                    }}
                    onDragLeave={() => setDragKey(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragKey(null);
                      handleFiles(item.key, e.dataTransfer.files);
                    }}
                    onClick={() => inputRefs.current[item.key]?.click()}
                    className={cn(
                      "rounded-md border border-dashed py-4 text-center text-xs text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors",
                      dragKey === item.key && "border-primary text-primary"
                    )}
                  >
                    <Upload className="h-4 w-4 mx-auto mb-1 opacity-60" />
                    将文件拖到此处，或点击选择（支持 JPG / PNG / PDF）
                  </div>
                )}

                {/* 已上传文件列表 */}
                {hasFile && (
                  <div className="space-y-1.5">
                    {itemFiles.map((f) => (
                      <div key={f.name} className="flex items-center gap-2 rounded-md bg-background border px-2.5 py-1.5">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{f.name}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span className="tabular-nums">{(f.size / 1024).toFixed(1)} KB</span>
                            {f.status === "uploading" && (
                              <span className="text-primary inline-flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                上传中…
                              </span>
                            )}
                            {f.status === "done" && (
                              <span className="text-success inline-flex items-center gap-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5" />已上传
                              </span>
                            )}
                            {f.status === "ai" && (
                              <span className="text-primary inline-flex items-center gap-0.5">
                                <Sparkles className="h-2.5 w-2.5" />AI 识别完成
                              </span>
                            )}
                          </div>
                          {f.status === "ai" && f.aiResult && (
                            <div className="text-[10px] text-foreground/80 mt-1 rounded bg-primary/5 border border-primary/15 px-2 py-1">
                              <Sparkles className="h-2.5 w-2.5 inline mr-1 text-primary" />
                              {f.aiResult}
                            </div>
                          )}
                        </div>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeFile(f.name, item.key)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 备注 */}
        <div className="space-y-1.5">
          <Label htmlFor="note" className="text-xs">备注（选填）</Label>
          <Textarea
            id="note"
            placeholder="如有特殊情况请说明，例如：身份证补办中，预计 5 月 20 日前提交…"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <DialogFooter className="gap-2">
          <div className="flex-1 text-xs text-muted-foreground self-center">
            {requiredDone ? (
              <span className="inline-flex items-center gap-1 text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />必传材料已齐全
              </span>
            ) : (
              <span>还需上传 <b className="text-warning">{items.filter((i) => i.required && !files.some((f) => f.itemKey === i.key && f.status !== "uploading")).length}</b> 项必传材料</span>
            )}
          </div>
          <Button variant="outline" onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={!requiredDone}>
            提交更新
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
