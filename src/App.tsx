import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import Attendance from "./pages/Attendance";
import AttendanceException from "./pages/AttendanceException";
import Recruiting from "./pages/Recruiting";
import JobProfile from "./pages/JobProfile";
import Candidates from "./pages/Candidates";
import Performance from "./pages/Performance";
import PerformanceSummary from "./pages/PerformanceSummary";
import PerformanceCycle from "./pages/PerformanceCycle";
import PerformanceForm from "./pages/PerformanceForm";
import PerformanceInterview from "./pages/PerformanceInterview";
import Training from "./pages/Training";
import TrainingMaterials from "./pages/TrainingMaterials";
import TrainingOffsite from "./pages/TrainingOffsite";
import TrainingQuestionBank from "./pages/TrainingQuestionBank";
import TrainingOnsite from "./pages/TrainingOnsite";
import TrainingMentors from "./pages/TrainingMentors";
import ChatNew from "./pages/ChatNew";
import ChatHistory from "./pages/ChatHistory";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendance/exception/:id" element={<AttendanceException />} />
            <Route path="/recruiting" element={<Recruiting />} />
            <Route path="/recruiting/job/:id" element={<JobProfile />} />
            <Route path="/recruiting/job/:id/candidates" element={<Candidates />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/performance/summary" element={<PerformanceSummary />} />
            <Route path="/performance/cycle/:id" element={<PerformanceCycle />} />
            <Route path="/performance/form/:id" element={<PerformanceForm />} />
            <Route path="/performance/interview/:id" element={<PerformanceInterview />} />
            <Route path="/training" element={<Training />} />
            <Route path="/training/materials" element={<TrainingMaterials />} />
            <Route path="/training/offsite" element={<TrainingOffsite />} />
            <Route path="/training/question-bank" element={<TrainingQuestionBank />} />
            <Route path="/training/onsite" element={<TrainingOnsite />} />
            <Route path="/training/mentors" element={<TrainingMentors />} />
            <Route path="/chat/new" element={<ChatNew />} />
            <Route path="/chat/history" element={<ChatHistory />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
