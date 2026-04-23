import { useState } from "react";
import { coursewares, questions } from "../training-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Video, Presentation } from "lucide-react";
import { toast } from "sonner";

const iconMap: Record<string, typeof FileText> = { FileText, Video, Presentation };

export default function MaterialBank() {
  const [tab, setTab] = useState<"courseware" | "questions">("courseware");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button size="sm" variant={tab === "courseware" ? "default" : "outline"} className={tab === "courseware" ? "bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg" : "rounded-lg"} onClick={() => setTab("courseware")}>课件</Button>
          <Button size="sm" variant={tab === "questions" ? "default" : "outline"} className={tab === "questions" ? "bg-[#1E6FFF] hover:bg-[#1E6FFF]/90 rounded-lg" : "rounded-lg"} onClick={() => setTab("questions")}>题库</Button>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => toast.success("上传素材 → AI 自动抽取题目（Mock）")}>
          <Upload className="h-4 w-4 mr-1" />{tab === "courseware" ? "上传素材" : "新增题目"}
        </Button>
      </div>

      {tab === "courseware" ? (
        <div className="grid grid-cols-3 gap-4">
          {coursewares.map(cw => {
            const Icon = iconMap[cw.icon] ?? FileText;
            return (
              <Card key={cw.id} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-50"><Icon className="h-5 w-5 text-blue-600" /></div>
                    <div>
                      <p className="font-medium text-sm">{cw.title}</p>
                      <p className="text-xs text-muted-foreground">{cw.type} · {cw.pages ? `${cw.pages}页` : cw.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>引用 {cw.refCount} 次</span>
                    <span>更新于 {cw.updatedAt}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium">题目</th>
                <th className="text-left p-3 font-medium">类型</th>
                <th className="text-left p-3 font-medium">知识点</th>
                <th className="text-left p-3 font-medium">所属素材</th>
              </tr></thead>
              <tbody>
                {questions.map(q => (
                  <tr key={q.id} className="border-b last:border-0">
                    <td className="p-3 max-w-xs truncate">{q.text}</td>
                    <td className="p-3"><Badge variant="outline" className="text-xs">{q.type === "single" ? "单选" : "判断"}</Badge></td>
                    <td className="p-3 text-xs text-muted-foreground">{q.topic}</td>
                    <td className="p-3 text-xs text-muted-foreground">{coursewares.find(c => c.id === q.coursewareId)?.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
