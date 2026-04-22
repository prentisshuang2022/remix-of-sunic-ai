/**
 * Tab 3: 加班调休
 * [BACKEND] 数据由后端 API 提供
 */
import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadAttendanceModal from "./UploadAttendanceModal";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { overtimeRows, dayoffRows } from "@/mocks/attendance";
import OvertimeDetailDrawer, { overtimeDetails } from "./OvertimeDetailDrawer";

export default function OvertimeLeave() {
  const [subTab, setSubTab] = useState<"overtime" | "dayoff">("overtime");
  const [campusFilter, setCampusFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [posFilter, setPosFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);

  const handleRowClick = (id: string) => {
    setSelectedDetail(id);
    setDetailOpen(true);
  };

  const filteredOT = overtimeRows.filter((r) => {
    if (campusFilter !== "all" && r.group !== campusFilter) return false;
    if (posFilter === "production" && !["生产岗", "质检岗"].includes(r.position)) return false;
    if (posFilter === "non-production" && ["生产岗", "质检岗"].includes(r.position)) return false;
    return true;
  });

  return (
    <>
    <div className="space-y-4">
      {/* 二级 Tab */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 border-b">
          {(["overtime", "dayoff"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                subTab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "overtime" ? "加班明细" : "调休明细"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4" />
            上传月度考勤表
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            导出 Excel
          </Button>
        </div>
      </div>

      {subTab === "overtime" ? (
        <>
          {/* 筛选 */}
          <div className="flex gap-2">
            <Select value={campusFilter} onValueChange={setCampusFilter}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="全部厂区" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部厂区</SelectItem>
                <SelectItem value="武汉总部">武汉总部</SelectItem>
                <SelectItem value="鄂州工厂">鄂州工厂</SelectItem>
              </SelectContent>
            </Select>
            <Select value={posFilter} onValueChange={setPosFilter}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="全部岗位" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部岗位</SelectItem>
                <SelectItem value="production">生产岗</SelectItem>
                <SelectItem value="non-production">非生产岗</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">姓名</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>职务</TableHead>
                  <TableHead>考勤组</TableHead>
                  <TableHead>加班日期</TableHead>
                  <TableHead>加班时间</TableHead>
                  <TableHead>加班事由</TableHead>
                  <TableHead>时长(h)</TableHead>
                  <TableHead>可调休(h)</TableHead>
                  <TableHead>补贴(¥)</TableHead>
                  <TableHead>备注</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOT.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                    onClick={() => handleRowClick(r.id)}
                  >
                    <TableCell className="pl-6 font-medium text-sm">{r.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.dept}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.position}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.group}</TableCell>
                    <TableCell className="text-sm">{r.date}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.startTime}-{r.endTime}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.reason}</TableCell>
                    <TableCell className="text-sm">{r.hours}</TableCell>
                    <TableCell className="text-sm">{r.canDayoff}</TableCell>
                    <TableCell className="text-sm">{r.subsidy > 0 ? `¥${r.subsidy}` : "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.remark}</TableCell>
                    <TableCell>
                      <button
                        className="text-xs text-[#3B5BDB] hover:underline"
                        onClick={(e) => { e.stopPropagation(); handleRowClick(r.id); }}
                      >
                        查看详情
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">姓名</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>累计可调休(h)</TableHead>
                <TableHead>已使用(h)</TableHead>
                <TableHead>剩余余额(h)</TableHead>
                <TableHead>最近使用日期</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dayoffRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-6 font-medium text-sm">{r.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.dept}</TableCell>
                  <TableCell className="text-sm">{r.totalHours}</TableCell>
                  <TableCell className="text-sm">{r.usedHours}</TableCell>
                  <TableCell className="text-sm font-medium">{r.remainHours}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.lastUsedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>

      <UploadAttendanceModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
