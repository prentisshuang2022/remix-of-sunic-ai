import React, { createContext, useContext, useState, useCallback } from "react";
import {
  initialTasks, initialRules,
  type TrainingTask, type TraineeRecord, type TrainingRule,
  type Question, autoGrade, getExamQuestions, questions as allQuestions,
} from "./training-store";

export type Role = "hr" | "employee";
export type HRTab = "dashboard" | "tasks" | "materials" | "employees";
export type EmpView = "taskList" | "taskDetail" | "learning" | "exam" | "examResult" | "errorReview" | "archive";

export interface ExamResultData {
  taskId: string;
  score: number;
  result: "通过" | "未通过";
  correctCount: number;
  totalCount: number;
  timeSpent: number;
  weakTopics: { topic: string; correctRate: number }[];
  strongTopics: { topic: string; correctRate: number }[];
  answers: Record<string, string>;
  questions: Question[];
  deptRank: { rank: number; total: number };
}

interface TrainingCtx {
  role: Role;
  setRole: (r: Role) => void;
  // HR
  hrTab: HRTab;
  setHRTab: (t: HRTab) => void;
  selectedTaskId: string | null;
  selectTask: (id: string) => void;
  backToTaskList: () => void;
  // Employee
  empView: EmpView;
  setEmpView: (v: EmpView) => void;
  empTaskId: string | null;
  setEmpTaskId: (id: string | null) => void;
  empExamResult: ExamResultData | null;
  setEmpExamResult: (r: ExamResultData | null) => void;
  // Data
  tasks: TrainingTask[];
  rules: TrainingRule[];
  addTask: (t: TrainingTask) => void;
  updateTrainee: (taskId: string, empId: string, update: Partial<TraineeRecord>) => void;
  toggleRule: (ruleId: string) => void;
  submitExam: (taskId: string, empId: string, answers: Record<string, string>, timeSpent: number) => void;
  currentEmpId: string;
}

const Ctx = createContext<TrainingCtx>(null!);
export const useTraining = () => useContext(Ctx);

export function TrainingProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("hr");
  const [hrTab, setHRTab] = useState<HRTab>("dashboard");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [empView, setEmpView] = useState<EmpView>("taskList");
  const [empTaskId, setEmpTaskId] = useState<string | null>(null);
  const [empExamResult, setEmpExamResult] = useState<ExamResultData | null>(null);

  const [tasks, setTasks] = useState<TrainingTask[]>(initialTasks);
  const [rules, setRules] = useState<TrainingRule[]>(initialRules);
  const currentEmpId = "e1";

  const selectTask = useCallback((id: string) => {
    setSelectedTaskId(id);
  }, []);

  const backToTaskList = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  const addTask = useCallback((t: TrainingTask) => {
    setTasks(prev => [t, ...prev]);
  }, []);

  const updateTrainee = useCallback((taskId: string, empId: string, update: Partial<TraineeRecord>) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        trainees: t.trainees.map(tr => tr.empId !== empId ? tr : { ...tr, ...update }),
      };
    }));
  }, []);

  const toggleRule = useCallback((ruleId: string) => {
    setRules(prev => prev.map(r => r.id !== ruleId ? r : { ...r, enabled: !r.enabled }));
  }, []);

  const submitExam = useCallback((taskId: string, empId: string, answers: Record<string, string>, timeSpent: number) => {
    const qs = getExamQuestions(taskId);
    const task = tasks.find(t => t.id === taskId);
    const gradeResult = autoGrade(qs, answers, task?.passingScore ?? 80);

    const traineeUpdate: Partial<TraineeRecord> = {
      examScore: gradeResult.score,
      result: gradeResult.result,
      answers,
      weakTopics: gradeResult.weakTopics,
      strongTopics: gradeResult.strongTopics,
      submittedAt: new Date().toISOString().slice(0, 10),
      timeSpent,
    };

    updateTrainee(taskId, empId, traineeUpdate);

    // Calculate dept rank (mock)
    const trainees = task?.trainees ?? [];
    const scoresAbove = trainees.filter(tr => tr.examScore !== null && tr.examScore > gradeResult.score).length;
    const rank = scoresAbove + 1;

    setEmpExamResult({
      taskId,
      score: gradeResult.score,
      result: gradeResult.result,
      correctCount: gradeResult.correctCount,
      totalCount: qs.length,
      timeSpent,
      weakTopics: gradeResult.weakTopics,
      strongTopics: gradeResult.strongTopics,
      answers,
      questions: qs,
      deptRank: { rank, total: trainees.length },
    });
    setEmpView("examResult");
  }, [tasks, updateTrainee]);

  return (
    <Ctx.Provider value={{
      role, setRole, hrTab, setHRTab,
      selectedTaskId, selectTask, backToTaskList,
      empView, setEmpView, empTaskId, setEmpTaskId,
      empExamResult, setEmpExamResult,
      tasks, rules, addTask, updateTrainee, toggleRule, submitExam,
      currentEmpId,
    }}>
      {children}
    </Ctx.Provider>
  );
}
