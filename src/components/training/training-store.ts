// ── Types ──────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  empNo: string;
  dept: string;
  role: string;
}

export interface Courseware {
  id: string;
  title: string;
  type: "PDF" | "video" | "PPT";
  pages?: number;
  duration?: string;
  icon: string;
  color: string;
  refCount: number;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: "single" | "judge";
  topic: string;
  coursewareId: string;
  options: string[];
  answer: string;
  explanation: string;
}

export type TaskType = "newEmployee" | "positionSkill" | "safeRetraining" | "newProcess";
export type TaskStatus = "inProgress" | "completed" | "draft";

export interface TraineeRecord {
  empId: string;
  notifyStatus: "未推送" | "已推送" | "已查看";
  learnStatus: "已完成" | "学习中" | "未开始";
  learnProgress: number;
  examScore: number | null;
  result: "通过" | "未通过" | "未完成";
  answers?: Record<string, string>;
  weakTopics?: { topic: string; correctRate: number }[];
  strongTopics?: { topic: string; correctRate: number }[];
  submittedAt?: string;
  timeSpent?: number;
}

export interface TrainingTask {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  target: string;
  headcount: number;
  deadline: string;
  createdBy: string;
  createdAt: string;
  coursewareIds: string[];
  questionIds: string[];
  passingScore: number;
  examDuration: number;
  examQuestionCount: number;
  trainees: TraineeRecord[];
}

export interface TrainingRule {
  id: string;
  name: string;
  trigger: "new_hire" | "attendance_anomaly" | "schedule";
  condition: string;
  action: { taskTemplateId: string };
  enabled: boolean;
  firedCount: number;
}

export const typeConfig: Record<TaskType, { label: string; bg: string; text: string; border: string }> = {
  newEmployee:    { label: "新员工入职", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  positionSkill:  { label: "岗位技能",   bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200" },
  safeRetraining: { label: "安全复训",   bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200" },
  newProcess:     { label: "新工艺导入", bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200" },
};

export const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string }> = {
  inProgress: { label: "进行中", bg: "bg-blue-50",   text: "text-blue-700" },
  completed:  { label: "已结束", bg: "bg-emerald-50", text: "text-emerald-700" },
  draft:      { label: "草稿",   bg: "bg-gray-100",  text: "text-gray-500" },
};

// ── Mock Data ─────────────────────────────────────────

export const employees: Employee[] = [
  { id: "e1", name: "张伟", avatar: "张", empNo: "SG2024001", dept: "生产部-SMT组", role: "组长" },
  { id: "e2", name: "李娜", avatar: "李", empNo: "SG2024002", dept: "生产部-封装组", role: "封装工" },
  { id: "e3", name: "王强", avatar: "王", empNo: "SG2024003", dept: "品质部", role: "品检员" },
  { id: "e4", name: "赵磊", avatar: "赵", empNo: "SG2024004", dept: "生产部-SMT组", role: "新员工" },
  { id: "e5", name: "孙敏", avatar: "孙", empNo: "SG2024005", dept: "生产部-无尘车间", role: "操作工" },
];

export const coursewares: Courseware[] = [
  { id: "c1", title: "SMT贴片机操作规范", type: "PDF", pages: 20, icon: "FileText", color: "blue", refCount: 8, updatedAt: "2026-04-01" },
  { id: "c2", title: "无尘车间行为规范", type: "video", duration: "8分钟", icon: "Video", color: "purple", refCount: 5, updatedAt: "2026-03-15" },
  { id: "c3", title: "静电防护ESD基础", type: "PPT", pages: 15, icon: "Presentation", color: "amber", refCount: 6, updatedAt: "2026-03-20" },
  { id: "c4", title: "LED封装工艺入门", type: "video", duration: "12分钟", icon: "Video", color: "green", refCount: 3, updatedAt: "2026-04-05" },
  { id: "c5", title: "新员工安全培训", type: "PDF", pages: 30, icon: "FileText", color: "red", refCount: 10, updatedAt: "2026-02-28" },
];

export const questions: Question[] = [
  { id: "q1", text: "SMT贴片机开机前必须检查的项目不包括以下哪项？", type: "single", topic: "SMT操作规范", coursewareId: "c1", options: ["检查气压是否正常", "检查锡膏温度", "检查办公室空调温度", "检查吸嘴状态"], answer: "检查办公室空调温度", explanation: "开机前需检查气压、锡膏温度和吸嘴状态，办公室空调温度与设备操作无关。" },
  { id: "q2", text: "SMT贴片机的吸嘴需要定期更换和清洗。", type: "judge", topic: "SMT操作规范", coursewareId: "c1", options: ["正确", "错误"], answer: "正确", explanation: "吸嘴是易耗件，需要定期清洗和更换以保证贴装精度。" },
  { id: "q3", text: "贴片精度偏差超过多少时需要停机校准？", type: "single", topic: "SMT操作规范", coursewareId: "c1", options: ["0.01mm", "0.05mm", "0.1mm", "0.5mm"], answer: "0.05mm", explanation: "按照操作规范，贴片精度偏差超过0.05mm需立即停机校准。" },
  { id: "q4", text: "回流焊温度曲线通常分为几个阶段？", type: "single", topic: "回流焊工艺", coursewareId: "c1", options: ["2个", "3个", "4个", "5个"], answer: "4个", explanation: "回流焊温度曲线分为预热、恒温、回流、冷却四个阶段。" },
  { id: "q5", text: "无铅回流焊的峰值温度一般不超过多少度？", type: "single", topic: "回流焊工艺", coursewareId: "c1", options: ["200°C", "230°C", "260°C", "300°C"], answer: "260°C", explanation: "无铅焊接峰值温度通常控制在245-260°C之间。" },
  { id: "q6", text: "无尘车间洁净度等级越高，数字越小。", type: "judge", topic: "无尘车间管理", coursewareId: "c2", options: ["正确", "错误"], answer: "正确", explanation: "ISO标准中，Class 1比Class 10洁净度更高，数字越小要求越严格。" },
  { id: "q7", text: "进入无尘车间前需要经过几道净化程序？", type: "single", topic: "无尘车间管理", coursewareId: "c2", options: ["1道", "2道", "3道", "4道"], answer: "3道", explanation: "通常需经过更衣、风淋、洗手消毒三道净化程序。" },
  { id: "q8", text: "无尘车间内可以使用普通纸张做记录。", type: "judge", topic: "无尘车间管理", coursewareId: "c2", options: ["正确", "错误"], answer: "错误", explanation: "普通纸张会产生纤维颗粒污染，必须使用无尘纸。" },
  { id: "q9", text: "进入无尘车间前必须穿戴的装备不包括以下哪项？", type: "single", topic: "人员着装规范", coursewareId: "c2", options: ["防静电连体服", "无尘鞋套", "太阳镜", "无尘手套"], answer: "太阳镜", explanation: "需穿戴防静电服、无尘鞋套和手套，太阳镜不属于无尘车间装备。" },
  { id: "q10", text: "防静电服需要每周清洗一次以保持防护效果。", type: "judge", topic: "人员着装规范", coursewareId: "c2", options: ["正确", "错误"], answer: "正确", explanation: "防静电服应定期清洗，建议每周至少一次，使用专用洗涤剂。" },
  { id: "q11", text: "人体静电电压最高可达到多少伏？", type: "single", topic: "静电防护基础", coursewareId: "c3", options: ["100V", "1000V", "10000V", "35000V"], answer: "35000V", explanation: "干燥环境下人体静电电压可高达35000V，远超电子元器件承受能力。" },
  { id: "q12", text: "静电放电（ESD）会损坏精密电子元器件。", type: "judge", topic: "静电防护基础", coursewareId: "c3", options: ["正确", "错误"], answer: "正确", explanation: "ESD是电子产品失效的主要原因之一，微小放电即可损坏芯片。" },
  { id: "q13", text: "以下哪项不属于有效的静电防护措施？", type: "single", topic: "静电防护基础", coursewareId: "c3", options: ["佩戴防静电手环", "使用防静电地板", "穿橡胶拖鞋", "保持环境湿度"], answer: "穿橡胶拖鞋", explanation: "橡胶是绝缘材料，不能导出静电，反而会积累静电。" },
  { id: "q14", text: "使用防静电手环时必须确保接地线连接良好。", type: "judge", topic: "ESD操作规程", coursewareId: "c3", options: ["正确", "错误"], answer: "正确", explanation: "防静电手环只有在正确接地时才能发挥泄放静电的作用。" },
  { id: "q15", text: "ESD防护区域的相对湿度应保持在什么范围？", type: "single", topic: "ESD操作规程", coursewareId: "c3", options: ["10%-20%", "30%-40%", "40%-70%", "80%-90%"], answer: "40%-70%", explanation: "适当的湿度有助于减少静电积累，推荐40%-70%的相对湿度。" },
  { id: "q16", text: "LED芯片的主要封装形式不包括以下哪种？", type: "single", topic: "LED封装工艺", coursewareId: "c4", options: ["直插式DIP", "表贴式SMD", "板上芯片COB", "螺旋式SPR"], answer: "螺旋式SPR", explanation: "常见LED封装形式有DIP、SMD、COB等，不存在螺旋式封装。" },
  { id: "q17", text: "LED封装过程中需要使用银胶或锡膏进行固晶。", type: "judge", topic: "LED封装工艺", coursewareId: "c4", options: ["正确", "错误"], answer: "正确", explanation: "固晶是LED封装关键工序，通常使用银胶或锡膏将芯片固定在支架上。" },
  { id: "q18", text: "车间内发现安全隐患应该首先怎么做？", type: "single", topic: "安全生产常识", coursewareId: "c5", options: ["继续工作等下班汇报", "立即报告班组长", "自己尝试处理", "发朋友圈"], answer: "立即报告班组长", explanation: "发现安全隐患应第一时间报告，不得延误或自行处置。" },
  { id: "q19", text: "灭火器应该对准火焰的根部进行喷射。", type: "judge", topic: "安全生产常识", coursewareId: "c5", options: ["正确", "错误"], answer: "正确", explanation: "灭火器使用要领：拔插销、握喷管、压手柄、对准火焰根部扫射。" },
  { id: "q20", text: "以下哪种行为违反车间安全规定？", type: "single", topic: "消防应急知识", coursewareId: "c5", options: ["穿戴劳保用品", "保持通道畅通", "在车间内吸烟", "按规程操作设备"], answer: "在车间内吸烟", explanation: "车间内严禁吸烟，这是最基本的安全规定。" },
];

const mkTrainee = (empId: string, notify: TraineeRecord["notifyStatus"], learn: TraineeRecord["learnStatus"], progress: number, score: number | null, result: TraineeRecord["result"], submitted?: string): TraineeRecord => ({
  empId, notifyStatus: notify, learnStatus: learn, learnProgress: progress, examScore: score, result, submittedAt: submitted,
});

export const initialTasks: TrainingTask[] = [
  {
    id: "t1", title: "新员工入职安全培训", type: "newEmployee", status: "inProgress",
    target: "全员新入职", headcount: 5, deadline: "2026-04-30",
    createdBy: "HR 李主管", createdAt: "2026-04-10",
    coursewareIds: ["c5"], questionIds: questions.map(q => q.id),
    passingScore: 80, examDuration: 30, examQuestionCount: 20,
    trainees: [
      mkTrainee("e1", "已查看", "已完成", 100, 92, "通过", "2026-04-15"),
      mkTrainee("e2", "已查看", "学习中", 60, null, "未完成"),
      mkTrainee("e3", "已推送", "未开始", 0, null, "未完成"),
      mkTrainee("e4", "已查看", "已完成", 100, 72, "未通过", "2026-04-16"),
      mkTrainee("e5", "已推送", "未开始", 0, null, "未完成"),
    ],
  },
  {
    id: "t2", title: "SMT贴片机操作规范培训", type: "positionSkill", status: "inProgress",
    target: "生产部-SMT组", headcount: 5, deadline: "2026-05-15",
    createdBy: "HR 李主管", createdAt: "2026-04-12",
    coursewareIds: ["c1"], questionIds: questions.map(q => q.id),
    passingScore: 80, examDuration: 30, examQuestionCount: 20,
    trainees: [
      mkTrainee("e1", "已查看", "已完成", 100, null, "未完成"),
      mkTrainee("e2", "已查看", "学习中", 40, null, "未完成"),
      mkTrainee("e3", "已推送", "学习中", 80, null, "未完成"),
      mkTrainee("e4", "已查看", "未开始", 0, null, "未完成"),
      mkTrainee("e5", "已推送", "未开始", 0, null, "未完成"),
    ],
  },
  {
    id: "t3", title: "无尘车间行为规范 Q1 复训", type: "safeRetraining", status: "completed",
    target: "生产部全员", headcount: 5, deadline: "2026-03-31",
    createdBy: "HR 李主管", createdAt: "2026-03-01",
    coursewareIds: ["c2"], questionIds: questions.map(q => q.id),
    passingScore: 80, examDuration: 30, examQuestionCount: 20,
    trainees: [
      mkTrainee("e1", "已查看", "已完成", 100, 85, "通过", "2026-03-20"),
      mkTrainee("e2", "已查看", "已完成", 100, 90, "通过", "2026-03-22"),
      mkTrainee("e3", "已查看", "已完成", 100, 88, "通过", "2026-03-21"),
      mkTrainee("e4", "已查看", "已完成", 100, 82, "通过", "2026-03-25"),
      mkTrainee("e5", "已查看", "已完成", 100, 94, "通过", "2026-03-19"),
    ],
  },
  {
    id: "t4", title: "LED封装工艺导入培训", type: "newProcess", status: "inProgress",
    target: "生产部-封装组", headcount: 3, deadline: "2026-05-20",
    createdBy: "HR 李主管", createdAt: "2026-04-15",
    coursewareIds: ["c4"], questionIds: questions.map(q => q.id),
    passingScore: 80, examDuration: 30, examQuestionCount: 20,
    trainees: [
      mkTrainee("e1", "已查看", "学习中", 50, null, "未完成"),
      mkTrainee("e2", "已查看", "已完成", 100, 88, "通过", "2026-04-20"),
      mkTrainee("e5", "已推送", "未开始", 0, null, "未完成"),
    ],
  },
  {
    id: "t5", title: "静电防护ESD年度复训", type: "safeRetraining", status: "draft",
    target: "全员", headcount: 5, deadline: "2026-06-30",
    createdBy: "HR 李主管", createdAt: "2026-04-20",
    coursewareIds: ["c3"], questionIds: questions.map(q => q.id),
    passingScore: 80, examDuration: 30, examQuestionCount: 20,
    trainees: [
      mkTrainee("e1", "未推送", "未开始", 0, null, "未完成"),
      mkTrainee("e2", "未推送", "未开始", 0, null, "未完成"),
      mkTrainee("e3", "未推送", "未开始", 0, null, "未完成"),
      mkTrainee("e4", "未推送", "未开始", 0, null, "未完成"),
      mkTrainee("e5", "未推送", "未开始", 0, null, "未完成"),
    ],
  },
];

export const initialRules: TrainingRule[] = [
  { id: "r1", name: "新员工自动派训", trigger: "new_hire", condition: "新员工入职 7 天内自动派发《新员工安全培训》", action: { taskTemplateId: "t1" }, enabled: true, firedCount: 12 },
  { id: "r2", name: "SMT岗位定期复训", trigger: "schedule", condition: "SMT 操作岗每 12 个月自动派发复训任务", action: { taskTemplateId: "t2" }, enabled: true, firedCount: 3 },
  { id: "r3", name: "违规异常触发复训", trigger: "attendance_anomaly", condition: "考勤助手报「违规操作」异常 → 自动触发安全复训", action: { taskTemplateId: "t1" }, enabled: true, firedCount: 2 },
  { id: "r4", name: "季度无尘车间复训", trigger: "schedule", condition: "每季度第 1 周自动派《无尘车间行为规范》给生产部全员", action: { taskTemplateId: "t3" }, enabled: false, firedCount: 1 },
];

export const deptStats = [
  { dept: "生产部-SMT组", trainRate: 92, passRate: 88 },
  { dept: "生产部-封装组", trainRate: 85, passRate: 90 },
  { dept: "品质部", trainRate: 78, passRate: 82 },
  { dept: "生产部-无尘车间", trainRate: 95, passRate: 94 },
  { dept: "工程部", trainRate: 70, passRate: 76 },
];

// ── Helpers ───────────────────────────────────────────

export function getExamQuestions(_taskId: string): Question[] {
  return questions;
}

export function autoGrade(
  qs: Question[],
  answers: Record<string, string>,
  passingScore: number,
): {
  score: number;
  result: "通过" | "未通过";
  correctCount: number;
  weakTopics: { topic: string; correctRate: number }[];
  strongTopics: { topic: string; correctRate: number }[];
} {
  let correct = 0;
  const topicStats: Record<string, { correct: number; total: number }> = {};

  for (const q of qs) {
    const isCorrect = answers[q.id] === q.answer;
    if (isCorrect) correct++;
    if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0 };
    topicStats[q.topic].total++;
    if (isCorrect) topicStats[q.topic].correct++;
  }

  const score = Math.round((correct / qs.length) * 100);
  const passed = score >= passingScore;

  const topicRates = Object.entries(topicStats).map(([topic, s]) => ({
    topic, correctRate: Math.round((s.correct / s.total) * 100),
  }));

  const weakTopics = topicRates.filter(t => t.correctRate < 70).sort((a, b) => a.correctRate - b.correctRate).slice(0, 3);
  const strongTopics = passed ? topicRates.filter(t => t.correctRate >= 90).sort((a, b) => b.correctRate - a.correctRate).slice(0, 3) : [];

  return { score, result: passed ? "通过" : "未通过", correctCount: correct, weakTopics, strongTopics };
}
