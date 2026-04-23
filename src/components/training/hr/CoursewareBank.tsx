import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Plus, FileText, Video, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";
import { coursewares, questions } from "../training-store";

const iconMap: Record<string, typeof FileText> = { FileText, Video, Presentation };

export default function CoursewareBank() {
  const [tab, setTab] = useState<"courseware" | "questions">("courseware");

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">题库与课件</h1>
        <div className="flex gap-2">
          {tab === "courseware" ? (
            <Button className="bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-xl" size="sm">
              <Upload className="h-4 w-4 mr-1.5" />上传课件
            </Button>
          ) : (
            <Button className="bg-sg-blue hover:bg-sg-blue/90 text-sg-blue-foreground rounded-xl" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />新增题目
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["courseware", "questions"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] transition-colors",
              tab === t ? "border-sg-blue text-sg-blue" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "courseware" ? "课件" : "题库"}
          </button>
        ))}
      </div>

      {/* Courseware grid */}
      {tab === "courseware" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coursewares.map(c => {
            const Icon = iconMap[c.icon] || FileText;
            return (
              <Card key={c.id} className="rounded-xl hover:shadow transition-shadow cursor-pointer">
                <CardContent className="p-4 space-y-3">
                  <div className={cn("w-full h-20 rounded-lg flex items-center justify-center", c.color)}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-sm font-medium">{c.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="rounded-full text-[10px]">{c.type}</Badge>
                    {c.pages && <span>{c.pages} 页</span>}
                    {c.duration && <span>{c.duration}</span>}
                    <span>· 被引用 {c.refCount} 次</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Questions list */}
      {tab === "questions" && (
        <Card className="rounded-xl">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium">题目</th>
                  <th className="text-left p-3 font-medium w-20">题型</th>
                  <th className="text-left p-3 font-medium w-40">所属课件</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(q => {
                  const cw = coursewares.find(c => c.id === q.coursewareId);
                  return (
                    <tr key={q.id} className="border-b hover:bg-accent/30">
                      <td className="p-3">{q.text}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className="rounded-full text-[10px]">{q.type}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{cw?.title ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
