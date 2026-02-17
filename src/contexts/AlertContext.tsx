import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type AlertSeverity = "success" | "error" | "warning" | "info";

export interface AlertData {
  id: string;
  severity: AlertSeverity;
  message: string;
}

interface AlertContextType {
  showAlert: (severity: AlertSeverity, message: string) => void;
  dismissAlert: (id: string) => void;
  alerts: AlertData[];
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const showAlert = useCallback((severity: AlertSeverity, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setAlerts((prev) => [...prev, { id, severity, message }]);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, dismissAlert, alerts }}>
      {children}
    </AlertContext.Provider>
  );
};
