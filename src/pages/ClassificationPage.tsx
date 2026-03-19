import React, { useEffect, useState } from "react";
import {
  Card,
  Spin,
  message,
  Typography,
  Radio,
  Button,
  Space,
  Tag,
  Divider,
  Alert,
  Modal,
  Input,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { TasksService } from "../services/task.service";
import { LabelService } from "../services/label.service";
import { AnnotationService } from "../services/annotation.service";

const { Title, Text } = Typography;

interface Task {
  taskId: number;
  fileUrl: string;
  status: number;
  descriptionError?: string;

  round: {
    roundId: number;
    roundNumber: number;
    shapeType: number;
    description: string;
  };

  annotation?: {
    annotationId: number;
    labelId: number;
    classification: string;
  };
}

interface Label {
  labelId: number;
  labelName: string;
}

const ClassificationPage: React.FC = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [loadingRequest, setLoadingRequest] = useState(false);
  // ========================
  // LOAD TASK
  // ========================

  const loadTask = async () => {
    try {
      setLoading(true);

      const data = await TasksService.getTaskById(Number(taskId));

      setTask(data);

      if (data.annotation) {
        setLabel(data.annotation.labelId);
      }

      const labelData = await LabelService.getByRound(data.round.roundId);
      setLabels(labelData);
    } catch {
      message.error("Cannot load task");
    } finally {
      setLoading(false);
    }
  };
  const handleRequestLabel = async () => {
    if (!newLabel.trim()) {
      message.warning("Please enter label name");
      return;
    }

    if (!task) return;

    try {
      setLoadingRequest(true);

      await LabelService.requestLabel({
        roundId: task.round.roundId,
        labelName: newLabel.trim(),
      });

      message.success("Request sent! Waiting for approval");

      setNewLabel("");
      setIsModalOpen(false);

      const labelData = await LabelService.getByRound(task.round.roundId);
      setLabels(labelData);
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Request failed";

      message.error(errMsg);
    } finally {
      setLoadingRequest(false);
    }
  };
  useEffect(() => {
    loadTask();
  }, []);

  const handleSubmit = async () => {
    if (!label || !task) {
      message.warning("Please choose a label");
      return;
    }

    try {
      setLoading(true);
      if (task.annotation) {
        await AnnotationService.update(task.annotation.annotationId, {
          labelId: label,
          classification: label.toString(),
        });

        message.success("Annotation updated");
      } else {
        await AnnotationService.create({
          taskId: task.taskId,
          roundId: task.round.roundId,
          labelId: label,
          classification: label.toString(),
        });

        message.success("Annotation submitted");
      }

      navigate("/tasks");
    } catch {
      message.error("Submit failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !task)
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div
      style={{
        padding: 40,
        maxWidth: 1000,
        margin: "auto",
      }}
    >
      <Title level={3}>Image Classification</Title>

      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {/* IMAGE */}

          {(() => {
            const url = task.fileUrl;
            const ext = url?.split(".").pop()?.toLowerCase();

            const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext || "");
            const isVideo = ["mp4", "mov", "avi"].includes(ext || "");
            const isAudio = ["mp3", "wav"].includes(ext || "");

            if (isImage) {
              return (
                <img
                  src={url}
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    border: "1px solid #eee",
                  }}
                />
              );
            }

            if (isVideo) {
              return (
                <video
                  src={url}
                  controls
                  style={{
                    width: "100%",
                    borderRadius: 10,
                  }}
                />
              );
            }

            if (isAudio) {
              return (
                <audio controls style={{ width: "100%" }}>
                  <source src={url} />
                </audio>
              );
            }

            return <Tag color="default">Unsupported file</Tag>;
          })()}

          {/* TASK INFO */}

          <Space>
            <Tag color="blue">Round {task.round.roundNumber}</Tag>
            <Tag color="purple">Classification</Tag>
          </Space>

          <Text type="secondary">{task.round.description}</Text>

          {/* ERROR FROM REVIEWER */}

          {task.descriptionError && (
            <Alert
              message="Reviewer Feedback"
              description={task.descriptionError}
              type="error"
              showIcon
            />
          )}

          <Divider />

          {/* LABEL SELECT */}

          <Title level={5}>Select Label</Title>
          <Button size="small" onClick={() => setIsModalOpen(true)}>
            Request Label
          </Button>
          <Radio.Group value={label} onChange={(e) => setLabel(e.target.value)}>
            <Space direction="vertical">
              {labels.map((item) => (
                <Radio
                  key={item.labelId}
                  value={item.labelId}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                  }}
                >
                  {item.labelName}
                </Radio>
              ))}
            </Space>
          </Radio.Group>

          <Divider />

          {/* SUBMIT */}

          <Button type="primary" size="large" block onClick={handleSubmit}>
            {task.annotation ? "Update Annotation" : "Submit Annotation"}
          </Button>
        </Space>
      </Card>
      <Modal
        title="Request New Label"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleRequestLabel}
        confirmLoading={loadingRequest}
        okText="Send Request"
      >
        <Input
          placeholder="Enter label name (e.g. Cat, Dog...)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ClassificationPage;
