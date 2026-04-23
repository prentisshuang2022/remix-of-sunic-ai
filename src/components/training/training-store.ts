/**
 * Shared mock data & reactive state for Training Assistant.
 * Both HR and Employee views read/write this store so data flows across roles.
 */

// ─── Types ───
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
  type: "PDF" | "视频" | "PPT";
  pages?: number;
  duration?: string;
  icon: string;
  color: string;
  refCount: number;
}

export interface Question {
  id: string;
  text: string;
  type: "单选" | "多选" | "判断";
  coursewareId: string;
  options?: string[];
  answer: string;
}

export type TaskType = "新员工入职" | "岗位技能" | "安全复训" | "新工艺导入";
export type TaskStatus = "进行中" | "已结束" | "草稿";

export interface TraineeRecord {
  empId: string;
  learnStatus: "已完成" | "学习中" | "未开始";
  learnProgress: number;
  examScore: number | null;
  result: "通过" | "未通过" | "未完成";
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

// ─── Mock employees ───
export const employees: Employee[] = [
  { id: "e1", name: "张伟", avatar: "张", empNo: "SG2024001", dept: "生产部-SMT组", role: "SMT组长" },
  { id: "e2", name: "李娜", avatar: "李", empNo: "SG2024012", dept: "生产部-封装组", role: "封装工" },
  { id: "e3", name: "王强", avatar: "王", empNo: "SG2024005", dept: "品质部", role: "品检员" },
  { id: "e4", name: "赵磊", avatar: "赵", empNo: "SG2024030", dept: "生产部-SMT组", role: "新员工" },
  { id: "e5", name: "孙敏", avatar: "孙", empNo: "SG2024018", dept: "生产部-封装组", role: "无尘车间操作员" },
];

// ─── Mock courseware ───
export const coursewares: Courseware[] = [
  { id: "c1", title: "SMT 贴片机操作规范", type: "PDF", pages: 20, icon: "FileText", color: "bg-sg-blue-soft text-sg-blue", refCount: 3 },
  { id: "c2", title: "无尘车间行为规范", type: "视频", duration: "8 分钟", icon: "Video", color: "bg-success-soft text-success", refCount: 2 },
  { id: "c3", title: "静电防护 ESD 基础", type: "PPT", pages: 15, icon: "Presentation", color: "bg-train-offline-soft text-train-offline", refCount: 2 },
  { id: "c4", title: "LED 封装工艺入门", type: "视频", duration: "12 分钟", icon: "Video", color: "bg-warning-soft text-warning", refCount: 1 },
  { id: "c5", title: "新员工安全培训", type: "PDF", pages: 30, icon: "FileText", color: "bg-danger-soft text-danger", refCount: 2 },
];

// ─── Mock questions ───
export const questions: Question[] = [
  { id: "q1", text: "SMT 贴片机开机前必须检查的项目不包括？", type: "单选", coursewareId: "c1", options: ["气压是否正常", "吸嘴是否清洁", "个人手机电量", "轨道宽度设置"], answer: "C" },
  { id: "q2", text: "进入无尘车间前必须穿戴防静电服", type: "判断", coursewareId: "c2", answer: "正确" },
  { id: "q3", text: "ESD 防护的核心原则是？", type: "单选", coursewareId: "c3", options: ["等电位连接", "提高湿度", "穿棉质衣物", "使用塑料包装"], answer: "A" },
  { id: "q4", text: "以下哪些属于 SMT 贴片常见缺陷？", type: "多选", coursewareId: "c1", options: ["虚焊", "偏移", "立碑", "过孔填充"], answer: "ABC" },
  { id: "q5", text: "无尘车间洁净度等级越高数字越大", type: "判断", coursewareId: "c2", answer: "错误" },
  { id: "q6", text: "LED 封装中，荧光粉的作用是？", type: "单选", coursewareId: "c4", options: ["散热", "波长转换", "防潮", "导电"], answer: "B" },
  { id: "q7", text: "静电电压超过多少伏可能损坏 CMOS 器件？", type: "单选", coursewareId: "c3", options: ["100V", "500V", "2000V", "10000V"], answer: "A" },
  { id: "q8", text: "回流焊温度曲线分为哪几个阶段？", type: "多选", coursewareId: "c1", options: ["预热区", "恒温区", "回流区", "冷却区"], answer: "ABCD" },
  { id: "q9", text: "无尘车间内可以使用普通纸巾", type: "判断", coursewareId: "c2", answer: "错误" },
  { id: "q10", text: "新员工入职安全培训必须在上岗前完成", type: "判断", coursewareId: "c5", answer: "正确" },
  { id: "q11", text: "灭火器使用步骤的正确顺序是？", type: "单选", coursewareId: "c5", options: ["拔-握-瞄-扫", "握-拔-瞄-扫", "瞄-拔-握-扫", "拔-瞄-握-扫"], answer: "A" },
  { id: "q12", text: "SMT 贴片机的贴装精度一般要求在多少以内？", type: "单选", coursewareId: "c1", options: ["0.01mm", "0.05mm", "0.1mm", "1mm"], answer: "B" },
  { id: "q13", text: "LED 芯片固晶工序使用的主要设备是？", type: "单选", coursewareId: "c4", options: ["固晶机", "贴片机", "回流焊", "波峰焊"], answer: "A" },
  { id: "q14", text: "防静电手环应连接到？", type: "单选", coursewareId: "c3", options: ["接地线", "电源线", "桌面", "金属外壳"], answer: "A" },
  { id: "q15", text: "车间发生火灾时应先报警再灭火", type: "判断", coursewareId: "c5", answer: "正确" },
];

// ─── Mock tasks ───
export const initialTasks: TrainingTask[] = [
  {
    id: "t1", title: "新员工入职培训", type: "新员工入职", status: "进行中",
    target: "生产部新入职员工", headcount: 12, deadline: "2026-04-30",
    createdBy: "HR 刘主管", createdAt: "2026-04-10",
    coursewareIds: ["c5"], questionIds: ["q10", "q11", "q15"],
    passingScore: 80, examDuration: 30, examQuestionCount: 20,
    trainees: [
      { empId: "e4", learnStatus: "学习中", learnProgress: 60, examScore: null, result: "未完成" },
      { empId: "e2", learnStatus: "已完成", learnProgress: 100, examScore: 92, result: "通过" },
      { empId: "e5", learnStatus: "已完成", learnProgress: 100, examScore: 85, result: "通过" },
    ],
  },
  {
    id: "t2", title: "SMT 贴片机操作规范培训", type: "岗位技能", status: "进行中",
    target: "生产部 SMT 组", headcount: 32, deadline: "2026-05-10",
    createdBy: "HR 刘主管", createdAt: "2026-04-05",
    coursewareIds: ["c1"], questionIds: ["q1", "q4", "q8", "q12"],
    passingScore: 80, examDuration: 30, examQuestionCount: 20,
    trainees: [
      { empId: "e1", learnStatus: "学习中", learnProgress: 60, examScore: null, result: "未完成" },
      { empId: "e4", learnStatus: "未开始", learnProgress: 0, examScore: null, result: "未完成" },
    ],
  },
  {
    id: "t3", title: "无尘车间行为规范 Q1 复训", type: "安全复训", status: "已结束",
    target: "生产部全员", headcount: 86, deadline: "2026-03-31",
    createdBy: "HR 刘主管", createdAt: "2026-03-01",
    coursewareIds: ["c2"], questionIds: ["q2", "q5", "q9"],
    passingScore: 80, examDuration: 30, examQuestionCount: 20,
    trainees: [
      { empId: "e1", learnStatus: "已完成", learnProgress: 100, examScore: 88, result: "通过" },
      { empId: "e5", learnStatus: "已完成", learnProgress: 100, examScore: 85, result: "通过" },
    ],
  },
  {
    id: "t4", title: "新款 LED 封装工艺导入培训", type: "新工艺导入", status: "进行中",
    target: "生产部-封装组", headcount: 25, deadline: "2026-05-15",
    createdBy: "HR 刘主管", createdAt: "2026-04-12",
    coursewareIds: ["c4"], questionIds: ["q6", "q13"],
    passingScore: 80, examDuration: 30, examQuestionCount: 20,
    trainees: [
      { empId: "e2", learnStatus: "学习中", learnProgress: 40, examScore: null, result: "未完成" },
    ],
  },
  {
    id: "t5", title: "静电防护 ESD 年度复训", type: "安全复训", status: "草稿",
    target: "全员", headcount: 0, deadline: "2026-06-30",
    createdBy: "HR 刘主管", createdAt: "2026-04-20",
    coursewareIds: ["c3"], questionIds: ["q3", "q7", "q14"],
    passingScore: 80, examDuration: 30, examQuestionCount: 20,
    trainees: [],
  },
];

// ─── Exam questions for employee exam (20 questions from task's courseware) ───
export function getExamQuestions(taskId: string): Question[] {
  // In real app, backend would generate. Here we repeat/shuffle from pool.
  const pool = [...questions];
  const result: Question[] = [];
  for (let i = 0; i < 20; i++) {
    result.push({ ...pool[i % pool.length], id: `exam-${i}` });
  }
  return result;
}

// ─── Department stats ───
export const deptStats = [
  { dept: "生产部-SMT组", trainRate: 94, passRate: 88, pending: 2 },
  { dept: "生产部-封装组", trainRate: 89, passRate: 91, pending: 1 },
  { dept: "品质部", trainRate: 100, passRate: 95, pending: 0 },
  { dept: "工程部", trainRate: 85, passRate: 82, pending: 3 },
];
