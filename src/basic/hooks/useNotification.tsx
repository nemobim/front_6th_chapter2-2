import { useState, useCallback, createContext, useContext, ReactNode, useMemo } from "react";
import { Notification } from "../types";
import ToastPortal from "../components/elements/ToastPortal";

/** 알림 스타일 */
export const TOAST_STYLES = {
  error: "bg-red-600",
  warning: "bg-yellow-600",
  success: "bg-green-600",
};

// Context 타입
interface NotificationContextType {
  addNotification: (message: string, type?: "error" | "success" | "warning") => void;
}

// Context 생성
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: "error" | "success" | "warning" = "success") => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const contextValue = useMemo(
    () => ({
      addNotification,
    }),
    [addNotification]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastPortal notifications={notifications} setNotifications={setNotifications} />
    </NotificationContext.Provider>
  );
};

// Context hook
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }

  return context;
};
