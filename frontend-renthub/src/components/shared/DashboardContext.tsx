// src/context/DashboardContext.tsx
import { createContext, useContext, useState } from "react";

type DashboardContextType = {
  overdueCount: number;
  setOverdueCount: (n: number) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
};

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [overdueCount, setOverdueCount] = useState(0);
  return (
    <DashboardContext.Provider value={{ overdueCount, setOverdueCount }}>
      {children}
    </DashboardContext.Provider>
  );
};
