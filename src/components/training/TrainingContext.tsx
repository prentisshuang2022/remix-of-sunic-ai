import React, { createContext, useContext, useState, useCallback } from "react";
import { initialTasks, type TrainingTask, type TraineeRecord } from "./training-store";

export type Role = "hr" | "employee";
export type HRPage = "dashboard" | "tasks" | "taskDetail" | "courseware" | "employees";
export type EmpTab = "home" | "training" | "profile";

interface TrainingCtx {
  role: Role;
  setRole: (r: Role) => void;
  // HR navigation
  hrPage: HRPage;
  setHRPage: (p: HRPage) => void;
  selectedTaskId: string | null;
  selectTask: (id: string) => void;
  // Employee navigation
  empTab: EmpTab;
  setEmpTab: (t: EmpTab) => void;
  empTaskId: string | null;
  setEmpTaskId: (id: string | null) => void;
  empExamActive: boolean;
  setEmpExamActive: (v: boolean) => void;
  empExamResult: { passed: boolean; score: number } | null;
  setEmpExamResult: (r: { passed: boolean; score: number } | null) => void;
  empLearning: boolean;
  setEmpLearning: (v: boolean) => void;
  // Data
  tasks: TrainingTask[];
  addTask: (t: TrainingTask) => void;
  updateTrainee: (taskId: string, empId: string, update: Partial<TraineeRecord>) => void;
  // Current employee for employee view
  currentEmpId: string;
}

const Ctx = createContext<TrainingCtx>(null!);
export const useTraining = () => useContext(Ctx);

export function TrainingProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("hr");
  const [hrPage, setHRPageRaw] = useState<HRPage>("dashboard");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [empTab, setEmpTab] = useState<EmpTab>("home");
  const [empTaskId, setEmpTaskId] = useState<string | null>(null);
  const [empExamActive, setEmpExamActive] = useState(false);
  const [empExamResult, setEmpExamResult] = useState<{ passed: boolean; score: number } | null>(null);
  const [empLearning, setEmpLearning] = useState(false);
  const [tasks, setTasks] = useState<TrainingTask[]>(initialTasks);
  const currentEmpId = "e1"; // Zhang Wei as default employee

  const setHRPage = useCallback((p: HRPage) => {
    setHRPageRaw(p);
    if (p !== "taskDetail") setSelectedTaskId(null);
  }, []);

  const selectTask = useCallback((id: string) => {
    setSelectedTaskId(id);
    setHRPageRaw("taskDetail");
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

  return (
    <Ctx.Provider value={{
      role, setRole, hrPage, setHRPage, selectedTaskId, selectTask,
      empTab, setEmpTab, empTaskId, setEmpTaskId,
      empExamActive, setEmpExamActive, empExamResult, setEmpExamResult,
      empLearning, setEmpLearning,
      tasks, addTask, updateTrainee, currentEmpId,
    }}>
      {children}
    </Ctx.Provider>
  );
}
