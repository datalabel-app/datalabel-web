import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { notification } from "antd";

export interface Noti {
  message: string;
  taskId: number;
  error?: string;
  type: "TASK_ASSIGNED" | "TASK_FOR_REVIEW" | "TASK_REJECTED";
}
export const useNotification = () => {
  const [notifications, setNotifications] = useState<Noti[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`https://datalabel.site/hub/notifications`, {
        accessTokenFactory: () => token!,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveNotification", (data: Noti) => {
      switch (data.type) {
        case "TASK_REJECTED":
          notification.error({
            message: "Task reject",
            description: data.error || data.message,
          });
          break;

        case "TASK_ASSIGNED":
          notification.info({
            message: "Task new",
            description: data.message,
          });
          break;

        case "TASK_FOR_REVIEW":
          notification.warning({
            message: "Task review",
            description: data.message,
          });
          break;

        default:
          notification.open({
            message: "Alert",
            description: data.message,
          });
      }

      setNotifications((prev) => [data, ...prev]);
    });

    connection
      .start()
      .then(() => console.log("SignalR connected"))
      .catch((err) => console.error("SignalR error:", err));

    return () => {
      connection.stop();
    };
  }, []);

  return { notifications };
};
