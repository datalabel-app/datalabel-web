import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Progress,
  Typography,
  Input,
  Spin,
  message,
  Select,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { TasksService } from "../services/task.service";

const { Title } = Typography;
const { Option } = Select;

interface Dataset {
  datasetId: number;
  datasetName: string;
}

interface Round {
  roundId: number;
  roundNumber: number;
  shapeType: number;
  description: string;
}

interface Task {
  taskId: number;
  dataItemId: number;
  fileUrl: string;
  status: number;
  round: Round;
  dataset: Dataset;
}

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const role = Number(localStorage.getItem("role"));

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);

  // ========================= LOAD TASKS =========================
  const loadTasks = async () => {
    try {
      setLoading(true);
      let data: Task[] = [];

      if (role === 3) {
        data = await TasksService.getTasksByAnnotator();
      } else if (role === 4) {
        data = await TasksService.getTasksByReviewer();
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
  }, []);

  // ========================= STATUS TAG =========================
  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="orange">Pending</Tag>;
      case 1:
        return <Tag color="blue">Annotating</Tag>;
      case 2:
        return <Tag color="green">Approved</Tag>;
      case 3:
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  // ========================= NAVIGATION =========================
  const handleAnnotate = (task: Task) => {
    if (task.round.shapeType === 1) {
      navigate(`/classification/${task.taskId}`);
    } else {
      navigate(`/annotate/${task.taskId}`);
    }
  };

  const handleReview = (task: Task) => {
    if (task.round.shapeType === 1) {
      navigate(`/review/type/${task.taskId}`);
    } else {
      navigate(`/review/${task.taskId}`);
    }
  };

  // ========================= GROUP BY ROUND =========================
  const groupedTasks = tasks.reduce((acc: any, task) => {
    const roundId = task.round.roundId;
    if (!acc[roundId]) {
      acc[roundId] = {
        round: task.round,
        tasks: [],
      };
    }
    acc[roundId].tasks.push(task);
    return acc;
  }, {});

  // ========================= FILTER =========================
  const filteredGroups = Object.values(groupedTasks)
    .map((group: any) => {
      let filteredTasks = group.tasks;

      // ================= SEARCH BY DATASET NAME =================
      if (search.trim()) {
        filteredTasks = filteredTasks.filter((t: Task) =>
          t.dataset?.datasetName.toLowerCase().includes(search.toLowerCase()),
        );
      }

      // ================= STATUS FILTER =================
      if (statusFilter !== null) {
        filteredTasks = filteredTasks.filter((t) => t.status === statusFilter);
      }

      return { ...group, tasks: filteredTasks };
    })
    .filter((group) => group.tasks.length > 0);

  // ========================= TABLE DATA =========================
  const tableData = filteredGroups.map((group: any) => {
    const total = group.tasks.length;
    const done =
      role === 3
        ? group.tasks.filter((t: Task) => [1, 2, 3].includes(t.status)).length
        : group.tasks.filter((t: Task) => [2, 3].includes(t.status)).length;

    return {
      key: group.round.roundId,
      roundNumber: group.round.roundNumber,
      description: group.round.description,
      datasetName: group.tasks[0]?.dataset?.datasetName,
      totalTasks: total,
      doneTasks: done,
      tasks: group.tasks,
    };
  });

  // ========================= TABLE COLUMNS =========================
  const columns = [
    { title: "Dataset", dataIndex: "datasetName", key: "dataset" },
    { title: "Round", dataIndex: "roundNumber", key: "round" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Progress",
      key: "progress",
      render: (_: any, record: any) => (
        <Progress
          percent={Math.round((record.doneTasks / record.totalTasks) * 100)}
          size="small"
        />
      ),
    },
  ];

  // ========================= LOADING =========================
  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>
        {role === 3 ? "My Annotation Tasks" : "My Review Tasks"}
      </Title>

      <div style={{ marginBottom: 20, display: "flex", gap: 16 }}>
        <Input
          style={{ width: 300 }}
          placeholder="Search by dataset name..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          style={{ width: 200 }}
          placeholder="Filter by Status"
          allowClear
          value={statusFilter}
          onChange={(value) => setStatusFilter(value ?? null)}
        >
          <Option value={0}>Pending</Option>
          <Option value={1}>Annotating</Option>
          <Option value={2}>Approved</Option>
          <Option value={3}>Rejected</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        expandable={{
          expandedRowRender: (record) => (
            <Table
              columns={[
                { title: "Task ID", dataIndex: "taskId", key: "taskId" },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (status: number) => getStatusTag(status),
                },
                {
                  title: "Action",
                  key: "action",
                  render: (_: any, task: Task) =>
                    role === 3 ? (
                      <Button
                        type="primary"
                        onClick={() => handleAnnotate(task)}
                      >
                        {task.status === 3 ? "Re-Annotate" : "Annotate"}
                      </Button>
                    ) : (
                      <Button type="primary" onClick={() => handleReview(task)}>
                        Review
                      </Button>
                    ),
                },
              ]}
              dataSource={record.tasks.map((t: Task) => ({
                ...t,
                key: t.taskId,
              }))}
              pagination={false}
            />
          ),
        }}
      />
    </div>
  );
};

export default TasksPage;
