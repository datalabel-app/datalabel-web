import React, { useEffect, useState } from "react";
import {
  Card,
  Space,
  Tag,
  Button,
  Typography,
  Spin,
  message,
  Modal,
  Input,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { TasksService } from "../services/task.service";
import { AnnotationService } from "../services/annotation.service";

const { Title, Text } = Typography;

const ReviewTypePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [annotation, setAnnotation] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [rejectModal, setRejectModal] = useState(false);
  const [errorText, setErrorText] = useState("");

  // ======================
  // LOAD DATA
  // ======================

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const taskRes = await TasksService.getTaskById(Number(id));
        setTask(taskRes);

        const annRes = await AnnotationService.getByTaskId(Number(id));

        if (annRes.length > 0) {
          setAnnotation(annRes[0]);
        }
      } catch {
        message.error("Cannot load review data");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  // ======================
  // APPROVE
  // ======================

  const approveTask = async () => {
    try {
      setSubmitLoading(true);

      await TasksService.update(Number(id), {
        status: "Approved",
      });
      navigate("/tasks");
      message.success("Task approved");
    } catch {
      message.error("Approve failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ======================
  // REJECT
  // ======================

  const openReject = () => {
    setErrorText("");
    setRejectModal(true);
  };

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
      navigate("/tasks");
      message.success("Task rejected");
      setRejectModal(false);
    } catch {
      message.error("Reject failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ======================
  // UI
  // ======================

  return (
    <Spin spinning={loading}>
      <div style={{ padding: 30 }}>
        <Card
          title={`Classification Review`}
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
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              {(() => {
                const url = task?.fileUrl;
                const ext = url?.split(".").pop()?.toLowerCase();

                const isImage = ["jpg", "jpeg", "png", "webp"].includes(
                  ext || "",
                );
                const isVideo = ["mp4", "mov", "avi"].includes(ext || "");
                const isAudio = ["mp3", "wav"].includes(ext || "");

                if (isImage) {
                  return (
                    <img
                      src={url}
                      style={{
                        maxWidth: 600,
                        width: "100%",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                      onClick={() => window.open(url, "_blank")}
                    />
                  );
                }

                if (isVideo) {
                  return (
                    <video
                      src={url}
                      controls
                      style={{
                        maxWidth: 600,
                        width: "100%",
                        borderRadius: 8,
                      }}
                    />
                  );
                }

                if (isAudio) {
                  return (
                    <audio controls style={{ width: "100%", maxWidth: 600 }}>
                      <source src={url} />
                    </audio>
                  );
                }

                return <Tag>Unsupported file</Tag>;
              })()}
            </div>

            {/* LABEL */}

            <div>
              <Title level={5}>Classification Result</Title>

              <Tag color="blue" style={{ fontSize: 16, padding: "6px 12px" }}>
                {annotation?.labelName}
              </Tag>
            </div>

            {/* ANNOTATOR */}

            <div>
              <Text strong>Annotated by: </Text>
              <Text>{annotation?.annotatorName}</Text>
            </div>

            {/* CREATED */}

            <div>
              <Text strong>Annotated at: </Text>
              <Text>
                {annotation?.createdAt
                  ? new Date(annotation.createdAt).toLocaleString()
                  : ""}
              </Text>
            </div>
          </Space>
        </Card>

        {/* REJECT MODAL */}

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
            placeholder="Example: Wrong classification label"
            value={errorText}
            onChange={(e) => setErrorText(e.target.value)}
          />
        </Modal>
      </div>
    </Spin>
  );
};

export default ReviewTypePage;
