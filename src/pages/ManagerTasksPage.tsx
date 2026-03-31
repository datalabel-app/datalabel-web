import { useEffect, useState } from "react";
import { Table, Tag, Button, Modal, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { TasksService } from "../services/task.service";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
export default function ManagerTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newDeadline, setNewDeadline] = useState<any>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await TasksService.getTaskManager();
      setTasks(res);
    } catch (err) {
      message.error("Load tasks failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenModal = (task: any) => {
    setSelectedTask(task);
    setNewDeadline(null);
    setOpenModal(true);
  };

  const handleUpdateDeadline = async () => {
    if (!newDeadline) {
      message.warning("Please select deadline");
      return;
    }

    try {
      await TasksService.updateDealine(selectedTask.taskId, {
        newDeadline: newDeadline.toISOString(),
      });

      message.success("Deadline updated");
      setOpenModal(false);
      fetchTasks();
    } catch (err: any) {
      message.error(err?.response?.data || "Update failed");
    }
  };

 const renderStatus = (status: number) => {
  switch (status) {
    case 0:
      return <Tag color="default">Pending</Tag>;
    case 1:
      return <Tag color="blue">Annotating</Tag>;
    case 2:
      return <Tag color="orange">Review</Tag>;
    case 3:
      return <Tag color="green">Done</Tag>;
    default:
      return <Tag>Unknown</Tag>;
  }
};
const renderDeadline = (deadline: string) => {
  if (!deadline) return "-";

  const now = dayjs();
  const d = dayjs(deadline);

  let color = "green";

  if (d.isBefore(now)) {
    color = "red";
  } else if (d.diff(now, "hour") <= 24) {
    color = "orange"; // 
  }

  return (
    <div>
      <Tag color={color}>
        {d.format("DD/MM/YYYY HH:mm")}
      </Tag>
      <div style={{ fontSize: 12, color: "#999" }}>
        {d.fromNow()} 
      </div>
    </div>
  );
};

  const columns = [
    {
      title: "Task ID",
      dataIndex: "taskId",
    },
    {
      title: "Project",
      dataIndex: "projectName",
    },
    {
      title: "Dataset",
      dataIndex: "datasetName",
    },
    {
      title: "Annotator",
      render: (_: any, record: any) =>
        record.annotator?.fullName || "-",
    },
    {
      title: "Reviewer",
      render: (_: any, record: any) =>
        record.reviewer?.fullName || "-",
    },
    {
      title: "Status",
      render: (_: any, record: any) => renderStatus(record.status),
    },
  {
  title: "Deadline",
  render: (_: any, record: any) => renderDeadline(record.deadline),
},
    {
      title: "Action",
      render: (_: any, record: any) => (
        <Button onClick={() => handleOpenModal(record)}>
         Extend the deadline
        </Button>
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="taskId"
        loading={loading}
        columns={columns}
        dataSource={tasks}
      />

     <Modal
  title="Extend the deadline"
  open={openModal}
  onCancel={() => setOpenModal(false)}
  onOk={handleUpdateDeadline}
>
  <DatePicker
    showTime
    style={{ width: "100%" }}
    onChange={(value) => setNewDeadline(value)}

    disabledDate={(current) => {
      return current && current < dayjs().startOf("day");
    }}

    disabledTime={(current) => {
      if (!current) return {};

      const now = dayjs();

      if (current.isSame(now, "day")) {
        return {
          disabledHours: () =>
            Array.from({ length: now.hour() }, (_, i) => i),

          disabledMinutes: (selectedHour) => {
            if (selectedHour === now.hour()) {
              return Array.from({ length: now.minute() }, (_, i) => i);
            }
            return [];
          },

          disabledSeconds: () => [],
        };
      }

      return {};
    }}
  />
</Modal>
    </>
  );
}