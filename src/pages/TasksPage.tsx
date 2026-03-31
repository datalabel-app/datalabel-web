import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Typography,
  Input,
  Spin,
  message,
  Card,
  Space,
  Select,
  Collapse,
} from "antd";
import {
  ClockCircleOutlined,

  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { TasksService } from "../services/task.service";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface Task {
  taskId: number;
  roundName: string;
  datasetName: string;
  annotatorName: string;
  reviewerName: string;
  dataItemCount: number;
  shapeType: number;
  status: number;
  deadline: string;
  items?: any[];
}

interface ProjectGroup {
  projectName: string;
  tasks: Task[];
}

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const role = Number(localStorage.getItem("role"));

  const [tasks, setTasks] = useState<ProjectGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | undefined>();

  // ================= LOAD =================
  const loadTasks = async () => {
    try {
      setLoading(true);

      let data: ProjectGroup[] = [];

      if (role === 3) {
        data = await TasksService.getTasksByAnnotator(search, statusFilter);
      } else if (role === 4) {
        data = await TasksService.getTasksByReviewer(search, statusFilter);
      }

      setTasks(data || []);
    } catch {
      message.error("Cannot load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [search, statusFilter]);

  // ================= NAVIGATION =================
  const goToTask = (task: Task) => {
    if (role === 3) {
      navigate(
        task.shapeType === 1
          ? `/classification/${task.taskId}`
          : `/annotate/${task.taskId}`,
      );
    }
    if (role === 4) {
      navigate(
        task.shapeType === 1
          ? `/review/type/${task.taskId}`
          : `/review/${task.taskId}`,
      );
    }
  };

  // ================= TAG =================
  const getShapeTag = (shapeType: number) =>
    shapeType === 1 ? (
      <Tag color="blue">Classification</Tag>
    ) : (
      <Tag color="green">BBox</Tag>
    );

  const renderStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag icon={<ClockCircleOutlined />}>Pending</Tag>;
      case 1:
        return <Tag color="processing">Annotating</Tag>;
      case 2:
        return <Tag color="warning">Review</Tag>;
      case 3:
        return <Tag color="success">Done</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  // ================= COLUMNS =================
  const columns = [
    {
      title: "Task ID",
      dataIndex: "taskId",
      width: 90,
    },
    {
      title: "Round",
      dataIndex: "roundName",
      render: (t: string) => <b>{t}</b>,
    },
    {
      title: "Dataset",
      dataIndex: "datasetName",
      render: (t: string) => <b>{t}</b>,
    },
    {
      title: "Type",
      dataIndex: "shapeType",
      render: getShapeTag,
    },
    {
      title: "Annotator",
      dataIndex: "annotatorName",
      render: (t: string) => <Tag color="blue">{t || "Unassigned"}</Tag>,
    },
    {
      title: "Reviewer",
      dataIndex: "reviewerName",
      render: (t: string) => <Tag color="purple">{t || "Unassigned"}</Tag>,
    },
    {
      title: "Items",
      dataIndex: "dataItemCount",
      render: (c: number) => <Tag color="gold">{c}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: renderStatusTag,
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      render: (deadline: string) => {
        if (!deadline) return <Tag>--</Tag>;

        const d = dayjs(deadline);
        const now = dayjs();

        const isOverdue = d.isBefore(now);
        const isNear = d.diff(now, "hour") <= 6 && !isOverdue;

        return (
          <div>
            <Tag color={isOverdue ? "red" : isNear ? "orange" : "blue"}>
              {d.format("DD/MM/YYYY HH:mm")}
            </Tag>
            <div style={{ fontSize: 12, color: "#999" }}>
              {isOverdue
                ? "Overdue"
                : isNear
                ? "Due soon"
                : `${d.diff(now, "day")} days left`}
            </div>
          </div>
        );
      },
    },
{
  title: "Action",
  render: (_: any, record: Task) => {
    let disabled = true;
    let buttonLabel = "Completed";

    const now = dayjs();

    // ❗ Check deadline trước
    if (record.deadline && dayjs(record.deadline).isBefore(now)) {
      return (
        <Button type="primary" disabled danger>
          Overdue
        </Button>
      );
    }

    // DONE → cả 2 đều disable
    if (record.status === 3) {
      return (
        <Button type="primary" disabled>
          Completed
        </Button>
      );
    }

    // Annotator
    if (role === 3) {
      if (record.status === 0 || record.status === 2) {
        disabled = false;
        buttonLabel = "Annotate";
      } else {
        buttonLabel = "Annotating";
      }
    }

    // Reviewer
    if (role === 4) {
      if (record.status === 1) {
        disabled = false;
        buttonLabel = "Review";
      } else {
        buttonLabel = "Waiting";
      }
    }

    return (
      <Button
        type="primary"
        disabled={disabled}
        danger={false}
        onClick={() => goToTask(record)}
      >
        {buttonLabel}
      </Button>
    );
  },
}
  ];

  // ================= LOADING =================
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* HEADER */}
      <Space direction="vertical" style={{ marginBottom: 20 }}>
        <Title level={3}>
          {role === 3 ? "My Annotation Tasks" : "My Review Tasks"}
        </Title>
        <Text type="secondary">Manage your tasks by project</Text>
      </Space>

      {/* FILTER */}
      <Card style={{ marginBottom: 20 }}>
        <Space>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />

          <Select
            placeholder="Status"
            allowClear
            style={{ width: 160 }}
            onChange={(v) => setStatusFilter(v)}
          >
            <Select.Option value={0}>Pending</Select.Option>
            <Select.Option value={1}>Annotating</Select.Option>
            <Select.Option value={2}>Review</Select.Option>
            <Select.Option value={3}>Done</Select.Option>
          </Select>
        </Space>
      </Card>

      <Collapse defaultActiveKey={["0"]}>
        {tasks.map((project, index) => (
          <Panel
            key={index}
            header={
              <Space>
                <b>📁 {project.projectName}</b>
                <Tag color="blue">{project.tasks.length}</Tag>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={project.tasks.map((t) => ({
                ...t,
                key: t.taskId,
              }))}
              pagination={false}
              bordered
            />
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default TasksPage;