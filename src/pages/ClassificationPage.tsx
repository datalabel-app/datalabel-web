import React, { useEffect, useState } from "react";
import { Card, Spin, message, Typography, Radio, Button, Space } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { TasksService } from "../services/task.service";
import { LabelService } from "../services/label.service";
import { AnnotationService } from "../services/annotation.service";

const { Title, Text } = Typography;

interface Task {
  taskId: number;
  dataItemId: number;
  fileUrl: string;
  status: number;
  round: {
    roundId: number;
    roundNumber: number;
    shapeType: number;
    description: string;
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

  // ========================
  // LOAD TASK
  // ========================

  const loadTask = async () => {
    try {
      setLoading(true);

      const data = await TasksService.getTaskById(Number(taskId));

      setTask(data);

      const labelData = await LabelService.getByRound(data.round.roundId);

      setLabels(labelData);
    } catch {
      message.error("Cannot load task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, []);

  // ========================
  // SUBMIT ANNOTATION
  // ========================

  const handleSubmit = async () => {
    if (!label || !task) {
      message.warning("Please choose a label");
      return;
    }

    try {
      await AnnotationService.create({
        taskId: taskId,
        roundId: task.round.roundId,
        labelId: label,
        classification: label.toString(),
      });

      message.success("Annotation submitted");

      navigate("/tasks");
    } catch (err) {
      message.error("Submit failed");
    }
  };

  if (loading || !task)
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: "auto" }}>
      <Title level={3}>Classification Task</Title>

      <Card>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {/* IMAGE */}

          <img
            src={task.fileUrl}
            style={{
              width: "100%",
              borderRadius: 8,
            }}
          />

          {/* DESCRIPTION */}

          <Text type="secondary">{task.round.description}</Text>

          {/* LABEL OPTIONS */}

          <Radio.Group value={label} onChange={(e) => setLabel(e.target.value)}>
            <Space direction="vertical">
              {labels.map((item) => (
                <Radio key={item.labelId} value={item.labelId}>
                  {item.labelName}
                </Radio>
              ))}
            </Space>
          </Radio.Group>

          {/* SUBMIT */}

          <Button type="primary" onClick={handleSubmit}>
            Submit Annotation
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default ClassificationPage;
