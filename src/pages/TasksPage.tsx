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
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { TasksService } from "../services/task.service";
import { REVIEW_STATUS } from "../constants/review-status";

const { Title, Text } = Typography;

interface Task {
  taskId: number;
  roundName: string;
  annotatorName: string;
  reviewerName: string;
  dataItemCount: number;
  shapeType: number;
  status: number;
  items?: any[];
}

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const role = Number(localStorage.getItem("role"));

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    // cleanup nếu user gõ tiếp
    return () => clearTimeout(handler);
  }, [search]);
  // ================= LOAD =================
  // ================= LOAD =================
  const loadTasks = async (searchValue = "", statusValue?: number) => {
    try {
      setLoading(true);

      let data: Task[] = [];

      if (role === 3) {
        data = await TasksService.getTasksByAnnotator(searchValue, statusValue);
      } else if (role === 4) {
        data = await TasksService.getTasksByReviewer(searchValue, statusValue);
      }

      setTasks(data || []);
    } catch {
      message.error("Cannot load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(debouncedSearch);
  }, [debouncedSearch]);

  // ================= FILTER =================
  const filtered = tasks.filter((t) =>
    t.roundName.toLowerCase().includes(search.toLowerCase()),
  );

  // ================= NAVIGATION =================
  const goToTask = (task: Task) => {
    if (role === 3) {
      if (task.shapeType === 1) {
        navigate(`/classification/${task.taskId}`);
      } else {
        navigate(`/annotate/${task.taskId}`);
      }
    }
    if (role === 4) {
      if (task.shapeType === 1) {
        navigate(`/review/type/${task.taskId}`);
      } else {
        navigate(`/review/${task.taskId}`);
      }
    }
  };

  // ================= SHAPE TAG =================
  const getShapeTag = (shapeType: number) => {
    return shapeType === 1 ? (
      <Tag color="blue">Classification</Tag>
    ) : (
      <Tag color="green">BBox</Tag>
    );
  };
  const renderStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return (
          <Tag icon={<ClockCircleOutlined />} color="default">
            Pending
          </Tag>
        );
      case 1:
        return (
          <Tag icon={<EditOutlined />} color="processing">
            Annotating
          </Tag>
        );
      case 2:
        return (
          <Tag icon={<EyeOutlined />} color="warning">
            Review
          </Tag>
        );
      case 3:
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Done
          </Tag>
        );
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  // ================= COLUMNS =================
  const columns = [
    {
      title: "Task ID",
      dataIndex: "taskId",
      key: "taskId",
      width: 100,
    },
    {
      title: "Round",
      dataIndex: "roundName",
      key: "roundName",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Dataset Name",
      dataIndex: "datasetName",
      key: "datasetName",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Type",
      dataIndex: "shapeType",
      key: "shapeType",
      render: (shapeType: number) => getShapeTag(shapeType),
    },
    {
      title: "Annotator",
      dataIndex: "annotatorName",
      key: "annotatorName",
      render: (text: string) => <Tag color="blue">{text || "Unassigned"}</Tag>,
    },
    {
      title: "Reviewer",
      dataIndex: "reviewerName",
      key: "reviewerName",
      render: (text: string) => (
        <Tag color="purple">{text || "Unassigned"}</Tag>
      ),
    },
    {
      title: "Items",
      dataIndex: "dataItemCount",
      key: "dataItemCount",
      render: (count: number) => <Tag color="gold">{count} items</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: number) => renderStatusTag(status),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Task) => {
        const isTaskCompletedForReviewer = (record: Task) => {
          return record.items?.every(
            (i: any) =>
              i.reviewStatus === REVIEW_STATUS.APPROVED ||
              i.reviewStatus === REVIEW_STATUS.REJECTED,
          );
        };

        const isCompleted = record.status === 3;
        const isReviewing = record.status === 2;
        const isPending = record.status === 0;

        const disabled =
          isCompleted ||
          (role === 3 && record.status === 1) ||
          (role === 4 && (isPending || isReviewing || isTaskCompletedForReviewer(record)));

        return (
          <Button
            type="primary"
            disabled={disabled}
            onClick={() => goToTask(record)}
          >
            {isCompleted || (role === 4 && isTaskCompletedForReviewer(record))
              ? "Completed"
              : role === 3
                ? "Annotate"
                : "Review"}
          </Button>
        );
      },
    },
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
      {/* TITLE */}
      <Space direction="vertical" style={{ marginBottom: 20 }}>
        <Title level={3}>
          {role === 3 ? "My Annotation Tasks" : "My Review Tasks"}
        </Title>
        <Text type="secondary">Manage and process your assigned tasks</Text>
      </Space>

      {/* SEARCH */}
      <Card style={{ marginBottom: 20 }}>
        <Input
          placeholder="Search by round name..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          style={{ width: 180, marginLeft: 12 }}
          placeholder="Filter by status"
          allowClear
          onChange={(value) => loadTasks(search, value)}
        >
          <Select.Option value={0}>Pending</Select.Option>
          <Select.Option value={1}>Annotating</Select.Option>
          <Select.Option value={2}>Review</Select.Option>
          <Select.Option value={3}>Done</Select.Option>
        </Select>
      </Card>

      {/* TABLE */}
      <Table
        columns={columns}
        dataSource={filtered.map((t) => ({
          ...t,
          key: t.taskId,
        }))}
        bordered
        pagination={{ pageSize: 6 }}
      />
    </div>
  );
};

export default TasksPage;
