import { Notification } from "../../types";
import { CloseIcon } from "./Icons";

export interface IToastProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

/** 알림 스타일 */
export const TOAST_STYLES = {
  error: "bg-red-600",
  warning: "bg-yellow-600",
  success: "bg-green-600",
};

const Toast = ({ notifications, setNotifications }: IToastProps) => {
  /** 알림 제거 */
  const handleRemoveNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-md shadow-md text-white flex justify-between items-center ${
                TOAST_STYLES[notif.type] || TOAST_STYLES.success
              }`}
            >
              <span className="mr-2">{notif.message}</span>
              <button
                onClick={() => handleRemoveNotification(notif.id)}
                className="text-white hover:text-gray-200"
              >
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Toast;
