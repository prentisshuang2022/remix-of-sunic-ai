import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";
import { useTraining } from "../TrainingContext";
import { coursewares } from "../training-store";
import { useState } from "react";

export default function LearningPage() {
  const { empTaskId, tasks, currentEmpId, setEmpLearning, updateTrainee } = useTraining();
  const task = tasks.find(t => t.id === empTaskId);
  const cw = task ? coursewares.find(c => task.coursewareIds.includes(c.id)) : null;
  const [progress, setProgress] = useState(60);

  const markDone = () => {
    if (task) {
      updateTrainee(task.id, currentEmpId, { learnStatus: "已完成", learnProgress: 100 });
    }
    setEmpLearning(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 p-3 border-b bg-card flex items-center justify-between">
        <span className="text-sm font-medium truncate">{cw?.title ?? "课件"}</span>
        <button onClick={() => setEmpLearning(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
      </div>

      {/* Content placeholder */}
      <div className="flex-1 flex items-center justify-center bg-muted/30 p-6">
        <div className="text-center space-y-3">
          <div className="w-48 h-64 mx-auto bg-card rounded-xl border shadow-sm flex items-center justify-center">
            <span className="text-4xl">{cw?.type === "视频" ? "▶️" : "📄"}</span>
          </div>
          <p className="text-xs text-muted-foreground">{cw?.type === "视频" ? "视频播放区域" : "PDF 预览区域"}</p>
          {cw?.type === "视频" && <p className="text-xs text-muted-foreground">时长：{cw.duration}</p>}
          {cw?.pages && <p className="text-xs text-muted-foreground">{cw.pages} 页</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-4 border-t bg-card space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">学习进度</span>
          <Progress value={progress} className="h-2 flex-1 rounded-full" />
          <span className="text-xs font-medium">{progress}%</span>
        </div>
        <Button className="w-full bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-lg" onClick={markDone}>
          标记已学完
        </Button>
        <p className="text-[10px] text-center text-muted-foreground">请认真学习完所有内容后再标记完成</p>
      </div>
    </div>
  );
}
