import React, { useEffect, useState } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Tag, Space, Button, message, Spin, Modal, Input } from "antd";
import { TasksService } from "../services/task.service";
import { AnnotationService } from "../services/annotation.service";

interface Box {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

const ReviewerPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [image] = useImage(imageUrl);

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [task, setTask] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [rejectModal, setRejectModal] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const taskRes = await TasksService.getTaskById(Number(id));
        setTask(taskRes);
        setImageUrl(taskRes.fileUrl);

        const annRes = await AnnotationService.getByTaskId(Number(id));

        const parsed = annRes.map((a: any) => {
          const c = JSON.parse(a.coordinates);

          return {
            id: a.annotationId,
            x: c.x,
            y: c.y,
            width: c.width,
            height: c.height,
            label: a.labelName,
          };
        });

        setBoxes(parsed);
      } catch {
        message.error("Cannot load review data");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const labelColors: Record<string, string> = {};

  boxes.forEach((b, i) => {
    const colors = ["#22c55e", "#3b82f6", "#f97316", "#ef4444"];
    labelColors[b.label] = colors[i % colors.length];
  });

  // APPROVE TASK
  const approveTask = async () => {
    try {
      setSubmitLoading(true);

      await TasksService.update(Number(id), {
        status: "Approved",
      });

      message.success("Task approved successfully");
      navigate("/tasks");
    } catch {
      message.error("Approve failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  // OPEN REJECT MODAL
  const openReject = () => {
    setErrorText("");
    setRejectModal(true);
  };

  // CONFIRM REJECT
  const confirmReject = async () => {
    if (!errorText) {
      message.warning("Please input error description");
      return;
    }

    try {
      setSubmitLoading(true);

      await TasksService.update(Number(id), {
        status: "Rejected",
        descriptionError: errorText,
      });

      message.success("Task rejected");
      setRejectModal(false);
      navigate("/tasks");
    } catch {
      message.error("Reject failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Spin spinning={loading} tip="Loading review data...">
      <div style={{ padding: 20 }}>
        <Card
          title={`Review Task #${task?.taskId}`}
          extra={
            <Space>
              <Button
                type="primary"
                loading={submitLoading}
                onClick={approveTask}
              >
                Approve
              </Button>

              <Button danger loading={submitLoading} onClick={openReject}>
                Reject
              </Button>
            </Space>
          }
        >
          <Stage width={900} height={600}>
            <Layer>
              {image && <KonvaImage image={image} />}

              {boxes.map((box) => (
                <React.Fragment key={box.id}>
                  <Rect
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    stroke={labelColors[box.label]}
                    strokeWidth={2}
                  />

                  <Text
                    text={box.label}
                    x={box.x}
                    y={box.y - 18}
                    fill={labelColors[box.label]}
                    fontSize={16}
                    fontStyle="bold"
                  />
                </React.Fragment>
              ))}
            </Layer>
          </Stage>

          <div style={{ marginTop: 20 }}>
            <Space wrap>
              {Object.keys(labelColors).map((l) => (
                <Tag key={l} color="blue">
                  {l}
                </Tag>
              ))}
            </Space>
          </div>
        </Card>

        <Modal
          title="Reject Task"
          open={rejectModal}
          onCancel={() => setRejectModal(false)}
          onOk={confirmReject}
          okText="Reject"
          okButtonProps={{ danger: true }}
        >
          <p>Please describe the annotation error:</p>

          <Input.TextArea
            rows={4}
            placeholder="Example: Bounding box error..."
            value={errorText}
            onChange={(e) => setErrorText(e.target.value)}
          />
        </Modal>
      </div>
    </Spin>
  );
};

export default ReviewerPage;
