import { Outlet } from "react-router-dom";
import { TrainingSidebar } from "./TrainingSidebar";

export function TrainingLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0">
      <TrainingSidebar />
      <div className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
