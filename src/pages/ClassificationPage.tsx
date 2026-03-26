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
  List,
  Progress,
  Modal,
  Input,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { TasksService } from "../services/task.service";
import { LabelService } from "../services/label.service";
import { AnnotationService } from "../services/annotation.service";

const { Title, Text } = Typography;

// ========================
// TYPES
// ========================

interface DataItem {
  itemId: number;
  fileUrl: string;
  status: string;

  annotationId?: number;
  labelId?: number;

  reviewStatus?: string;
  reviewComment?: string;
  errorMessage?: string;
}

interface TaskDetail {
  taskId: number;
  roundId: number;
  roundName: string;
  shapeType: number;
  dataItems: DataItem[];
}

interface Label {
  labelId: number;
  labelName: string;
}

// ========================
// COMPONENT
// ========================

const ClassificationPage: React.FC = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentItem, setCurrentItem] = useState<DataItem | null>(null);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestLabelName, setRequestLabelName] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [annotations, setAnnotations] = useState<{
    [key: number]: {
      labelId: number;
      annotationId?: number;
    };
  }>({});

  // ========================
  // LOAD DATA
  // ========================

  const loadTask = async () => {
    try {
      setLoading(true);

      const data = await TasksService.getTaskById(Number(taskId));
      setTask(data);

      if (data.dataItems.length > 0) {
        setCurrentItem(data.dataItems[0]);
      }

      // sync annotation từ BE
      const map: any = {};
      data.dataItems.forEach((item: any) => {
        if (item.labelId !== undefined && item.labelId !== null) {
          map[item.itemId] = {
            labelId: item.labelId,
            annotationId: item.annotationId,
          };
        }
      });

      setAnnotations(map);

      const labelData = await LabelService.getByRound(data.roundId);
      setLabels(labelData);
    } catch {
      message.error("Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, []);

  // ========================
  // SELECT LABEL
  // ========================

  const handleSelectLabel = (value: number) => {
    if (!currentItem || !task) return;

    if (currentItem.reviewStatus === "Approved") return;

    setAnnotations((prev) => ({
      ...prev,
      [currentItem.itemId]: {
        labelId: value,
        annotationId: prev[currentItem.itemId]?.annotationId,
      },
    }));

    // auto next
    const index = task.dataItems.findIndex(
      (i) => i.itemId === currentItem.itemId,
    );

    if (index < task.dataItems.length - 1) {
      setTimeout(() => {
        setCurrentItem(task.dataItems[index + 1]);
      }, 200);
    }
  };

  // ========================
  // RENDER FILE
  // ========================

  const renderFile = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
      return <img src={url} style={{ width: "40%", borderRadius: 10 }} />;
    }

    if (["mp4"].includes(ext || "")) {
      return <video src={url} controls style={{ width: "40%" }} />;
    }

    if (["mp3"].includes(ext || "")) {
      return <audio controls src={url} style={{ width: "100%" }} />;
    }

    return <Tag>Unsupported</Tag>;
  };

  // ========================
  // PROGRESS (FIX CHUẨN)
  // ========================

  const total = task?.dataItems.length || 0;

  const done =
    task?.dataItems.filter((item) => {
      // Approved auto done
      if (item.reviewStatus === "Approved") return true;

      const annotation = annotations[item.itemId];

      return annotation && annotation.labelId;
    }).length || 0;

  const percent = total ? Math.round((done / total) * 100) : 0;

  // ========================
  // SUBMIT
  // ========================

  const handleSubmitAll = async () => {
    if (!task) return;

    if (done !== total) {
      message.warning("Bạn chưa annotate hết!");
      return;
    }

    try {
      setLoading(true);

      const createItems: any[] = [];
      const updateItems: any[] = [];

      task.dataItems.forEach((item) => {
        // ❌ bỏ qua approved
        if (item.reviewStatus === "Approved") return;

        const state = annotations[item.itemId];

        // ❌ chưa chọn label thì bỏ
        if (!state?.labelId) return;

        const payloadItem = {
          itemId: item.itemId,
          labelId: state.labelId,
          classification: state.labelId.toString(),
        };

        // 🔥 CASE 1: BE trả annotationId dạng phẳng
        if (item.annotationId) {
          updateItems.push({
            ...payloadItem,
            annotationId: item.annotationId,
          });
          return;
        }

        // 🔥 CASE 2: BE trả annotations[]
        const annotationFromBE = (item as any).annotations?.[0];

        if (annotationFromBE?.annotationId) {
          updateItems.push({
            ...payloadItem,
            annotationId: annotationFromBE.annotationId,
          });
        } else {
          createItems.push(payloadItem);
        }
      });

      console.log("CREATE ITEMS", createItems);
      console.log("UPDATE ITEMS", updateItems);

      // 🔥 CALL API
      if (createItems.length > 0) {
        await AnnotationService.bulkCreateClassfication({
          taskId: task.taskId,
          roundId: task.roundId,
          items: createItems,
        });
      }

      if (updateItems.length > 0) {
        await AnnotationService.updateBulk({
          taskId: task.taskId,
          roundId: task.roundId,
          items: updateItems,
        });
      }

      message.success("Submit success!");
      navigate("/tasks");
    } catch (err) {
      console.error(err);
      message.error("Submit failed");
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // UI
  // ========================

  if (loading || !task)
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  const renderThumbnail = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
      return (
        <img
          src={url}
          style={{
            width: 60,
            height: 60,
            objectFit: "cover",
            borderRadius: 6,
          }}
        />
      );
    }

    if (["mp4", "webm"].includes(ext || "")) {
      return (
        <video src={url} style={{ width: 60, height: 60, borderRadius: 6 }} />
      );
    }

    if (["mp3", "wav"].includes(ext || "")) {
      return <audio src={url} controls style={{ width: 120 }} />;
    }

    return <Tag>File</Tag>;
  };

  return (
    <div style={{ padding: 30 }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={3}>Task #{task.taskId}</Title>
          <Text>
            {done}/{total} completed
          </Text>
        </div>

        <div>
          <Button
            type="primary"
            onClick={handleSubmitAll}
            disabled={done !== total}
          >
            Submit
          </Button>
          <Button
            type="dashed"
            style={{ marginLeft: 10 }}
            onClick={() => setRequestModalVisible(true)}
          >
            Request Label
          </Button>
        </div>
      </div>

      <Progress percent={percent} />

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        {/* LEFT */}
        <Card style={{ width: 320 }}>
          <List
            dataSource={task.dataItems}
            renderItem={(item) => {
              const annotation = annotations[item.itemId];
              const hasAnnotated = !!annotation?.labelId;

              const review = item.reviewStatus?.toLowerCase();

              const isApproved = review === "approved";
              const isRejected = review === "rejected";

              return (
                <List.Item
                  onClick={() => setCurrentItem(item)}
                  style={{
                    cursor: "pointer",
                    background:
                      currentItem?.itemId === item.itemId ? "#e6f4ff" : "",
                    border: isRejected ? "1px solid red" : "",
                  }}
                >
                  <Space>
                    {renderThumbnail(item.fileUrl)}

                    <div>
                      <Text>Item #{item.itemId}</Text>
                      <br />

                      <Tag
                        color={
                          isApproved
                            ? "green"
                            : isRejected
                              ? "red"
                              : hasAnnotated
                                ? "blue"
                                : "default"
                        }
                      >
                        {isApproved
                          ? "Approved"
                          : isRejected
                            ? "Rejected"
                            : hasAnnotated
                              ? "Annotated"
                              : "Pending"}
                      </Tag>
                    </div>
                  </Space>
                </List.Item>
              );
            }}
          />
        </Card>

        {/* RIGHT */}
        <Card style={{ flex: 1 }}>
          {currentItem && (
            <Space direction="vertical" style={{ width: "100%" }}>
              {renderFile(currentItem.fileUrl)}

              <Divider />

              <Radio.Group
                disabled={currentItem.reviewStatus === "Approved"}
                value={annotations[currentItem.itemId]?.labelId}
                onChange={(e) => handleSelectLabel(e.target.value)}
              >
                <Space direction="vertical">
                  {labels.map((l) => (
                    <Radio key={l.labelId} value={l.labelId}>
                      {l.labelName}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>

              {currentItem.reviewStatus && (
                <>
                  <Divider />
                  <Tag
                    color={
                      currentItem.reviewStatus === "Approved" ? "green" : "red"
                    }
                  >
                    {currentItem.reviewStatus}
                  </Tag>
                  <Text>{currentItem.reviewComment}</Text>
                </>
              )}
            </Space>
          )}
        </Card>
        <Modal
          title="Request New Label"
          open={requestModalVisible}
          onCancel={() => setRequestModalVisible(false)}
          onOk={async () => {
            if (!requestLabelName.trim()) {
              message.warning("Input label ");
              return;
            }

            try {
              setRequesting(true);
              await LabelService.requestLabel({
                roundId: task!.roundId,
                labelName: requestLabelName.trim(),
              });
              message.success(`Requested label: ${requestLabelName}`);

              const updatedLabels = await LabelService.getByRound(
                task!.roundId,
              );
              setLabels(updatedLabels);

              setRequestLabelName("");
              setRequestModalVisible(false);
            } catch (err) {
              console.error(err);
              message.error("Request label failed");
            } finally {
              setRequesting(false);
            }
          }}
          confirmLoading={requesting}
        >
          <Input
            placeholder="Enter new label"
            value={requestLabelName}
            onChange={(e) => setRequestLabelName(e.target.value)}
          />
        </Modal>
      </div>
    </div>
  );
};

export default ClassificationPage;
