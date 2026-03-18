import React, { useEffect, useState } from "react";
import {
  Input,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Spin,
  Empty,
  message,
  Button,
  Tag,
  Progress,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { TasksService } from "../services/task.service";

const { Title, Text } = Typography;

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
}

const TasksPage: React.FC = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const role = Number(localStorage.getItem("role"));

  // =========================
  // LOAD TASKS
  // =========================

  const loadTasks = async () => {
    try {
      setLoading(true);

      let data: Task[] = [];

      if (role === 3) {
        data = await TasksService.getTasksByAnnotator();
      }

      if (role === 4) {
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

  // =========================
  // STATUS TAG
  // =========================

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

  // =========================
  // NAVIGATE
  // =========================

  const handleAnnotate = (task: Task) => {
    if (task.round.shapeType === 1) {
      navigate(`/classification/${task.taskId}`);
    } else {
      navigate(`/annotate/${task.taskId}`);
    }
  };

  // =========================
  // FILTER
  // =========================

  const filtered = tasks.filter((t) =>
    t.fileUrl?.toLowerCase().includes(search.toLowerCase()),
  );

  // =========================
  // GROUP TASKS BY ROUND
  // =========================

  const groupedTasks = filtered.reduce((acc: any, task) => {
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

      {/* SEARCH */}

      <Input
        style={{ width: 300, marginBottom: 30 }}
        placeholder="Search image..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <Empty description="No tasks found" />
      ) : (
        Object.values(groupedTasks).map((group: any) => {
          const total = group.tasks.length;

          let done = 0;

          // Annotator progress
          if (role === 3) {
            done = group.tasks.filter(
              (t: Task) => t.status === 1 || t.status === 2 || t.status === 3,
            ).length;
          }

          // Reviewer progress
          if (role === 4) {
            done = group.tasks.filter(
              (t: Task) => t.status === 2 || t.status === 3,
            ).length;
          }

          const percent = total === 0 ? 0 : Math.round((done / total) * 100);

          return (
            <div key={group.round.roundId} style={{ marginBottom: 50 }}>
              {/* ROUND HEADER */}

              <Card style={{ marginBottom: 20 }} bodyStyle={{ padding: 16 }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Title level={4} style={{ margin: 0 }}>
                    Round {group.round.roundNumber}
                  </Title>

                  <Text type="secondary">{group.round.description}</Text>

                  <Progress percent={percent} size="small" />

                  <Text type="secondary">
                    {done} / {total} {role === 3 ? "annotated" : "reviewed"}
                  </Text>
                </Space>
              </Card>

              {/* TASK GRID */}

              <Row gutter={[16, 16]}>
                {group.tasks.map((task: Task) => (
                  <Col span={6} key={task.taskId}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: 12,
                        overflow: "hidden",
                      }}
                      cover={
                        <img
                          src={task.fileUrl}
                          style={{
                            height: 200,
                            objectFit: "cover",
                          }}
                        />
                      }
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {getStatusTag(task.status)}

                        {/* ANNOTATOR */}

                        {role === 3 && task.status === 0 && (
                          <Button
                            type="primary"
                            block
                            onClick={() => handleAnnotate(task)}
                          >
                            Start Annotation
                          </Button>
                        )}

                        {role === 3 && task.status === 3 && (
                          <Button
                            type="primary"
                            block
                            onClick={() => handleAnnotate(task)}
                          >
                            Re-Annotate
                          </Button>
                        )}

                        {role === 3 && task.status === 1 && (
                          <Button block disabled>
                            Waiting for Review
                          </Button>
                        )}

                        {/* REVIEWER */}

                        {role === 4 && task.status === 0 && (
                          <Button block disabled>
                            Waiting for Annotation
                          </Button>
                        )}

                        {role === 4 && task.status === 1 && (
                          <Button
                            type="primary"
                            block
                            onClick={() => navigate(`/review/${task.taskId}`)}
                          >
                            Start Review
                          </Button>
                        )}

                        {task.status === 2 && (
                          <Button block disabled>
                            Completed
                          </Button>
                        )}
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TasksPage;
