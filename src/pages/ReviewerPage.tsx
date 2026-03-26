import React, { useEffect, useRef, useState } from "react";
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
  List,
  Divider,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Stage, Layer, Rect, Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";

import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { TasksService } from "../services/task.service";

const { Title, Text: AntText } = Typography;

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

  const [task, setTask] = useState<any>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [image] = useImage(imageUrl);

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [reviewMap, setReviewMap] = useState<any>({}); // key = itemId_labelId

  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [rejectItemId, setRejectItemId] = useState<number | null>(null);

  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const stageRef = useRef<any>(null);

  /* ================= LOAD TASK ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await TasksService.getTaskById(Number(id));
        setTask(res);

        if (res.dataItems.length > 0) {
          loadItem(res.dataItems[0]);
        }
      } catch {
        message.error("Load failed");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  /* ================= LOAD ITEM ================= */
  const loadItem = (item: any) => {
    setCurrentItem(item);
    setImageUrl(item.fileUrl);

    if (item.annotations) {
      const parsed = item.annotations.map((ann: any) => {
        const c = JSON.parse(ann.coordinates);
        return {
          id: ann.annotationId,
          x: c.x,
          y: c.y,
          width: c.width,
          height: c.height,
          label: c.label,
          labelId: ann.labelId,
        };
      });

      setBoxes(parsed);
    } else {
      setBoxes([]);
    }
  };

  /* ================= AUTO FIT ================= */
  useEffect(() => {
    if (!image) return;

    const maxW = window.innerWidth - 600;
    const maxH = window.innerHeight - 300;

    const ratio = Math.min(maxW / image.width, maxH / image.height);

    setScale(ratio);
    setPos({ x: 20, y: 20 });
  }, [image]);

  /* ================= HELPER ================= */
  const getItemStatus = (itemId: number) => {
    const keys = Object.keys(reviewMap).filter((k) =>
      k.startsWith(itemId + "_"),
    );

    if (keys.length === 0) return null;

    const statuses = keys.map((k) => reviewMap[k].Status);

    if (statuses.includes("Rejected")) return "Rejected";
    if (statuses.every((s) => s === "Approved")) return "Approved";

    return "Pending";
  };

  const getItemComment = (itemId: number) => {
    const keys = Object.keys(reviewMap).filter((k) =>
      k.startsWith(itemId + "_"),
    );

    const rejected = keys.find((k) => reviewMap[k].Status === "Rejected");

    return rejected ? reviewMap[rejected].Comment : null;
  };

  /* ================= APPROVE ================= */
  const approveItem = (item: any) => {
    if (!item || !item.annotations?.length) {
      message.warning("Item không có annotation");
      return;
    }

    setReviewMap((prev: any) => {
      const updated = { ...prev };

      item.annotations.forEach((ann: any) => {
        updated[`${item.itemId}_${ann.labelId}`] = {
          Status: "Approved",
          LabelId: ann.labelId,
        };
      });

      return updated;
    });
  };

  /* ================= REJECT ================= */
  const openReject = (item: any) => {
    setRejectItemId(item.itemId);
    setErrorText("");
    setRejectModal(true);
  };

  const confirmReject = () => {
    if (!errorText || rejectItemId === null) {
      message.warning("Nhập lý do");
      return;
    }

    const item = task.dataItems.find((i: any) => i.itemId === rejectItemId);
    if (!item) return;

    setReviewMap((prev: any) => {
      const updated = { ...prev };
      item.annotations.forEach((ann: any) => {
        updated[`${rejectItemId}_${ann.labelId}`] = {
          Status: "Rejected",
          Comment: errorText,
          LabelId: ann.labelId,
        };
      });
      return updated;
    });

    setRejectModal(false);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const finalItems: any = {};

      Object.keys(reviewMap).forEach((key) => {
        const [itemIdStr] = key.split("_");
        const itemId = Number(itemIdStr);

        finalItems[itemId] = reviewMap[key];
      });

      console.log("SUBMIT PAYLOAD:", finalItems);

      await TasksService.reviewBulk({
        taskId: Number(id),
        items: finalItems,
      });

      message.success("Review success");

      const reload = await TasksService.getTaskById(Number(id));
      setTask(reload);

      navigate("/tasks");
      setReviewMap({});
    } catch (err) {
      console.error(err);
      message.error("Submit failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= COLOR ================= */
  const labelColors: Record<string, string> = {};
  boxes.forEach((b, i) => {
    const colors = ["#22c55e", "#3b82f6", "#f97316", "#ef4444"];
    labelColors[b.label] = colors[i % colors.length];
  });

  if (loading || !task) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Annotating":
        return "processing";
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Space style={{ marginBottom: 20 }}>
        <Title level={3}>Review Task #{task.taskId}</Title>

        <Button
          type="primary"
          onClick={handleSubmit}
          disabled={Object.keys(reviewMap).length === 0}
        >
          Submit Review
        </Button>

        <Button
          icon={<ZoomInOutlined />}
          onClick={() => setScale((s) => s * 1.2)}
        />
        <Button
          icon={<ZoomOutOutlined />}
          onClick={() => setScale((s) => s * 0.8)}
        />
      </Space>

      <div style={{ display: "flex", gap: 20 }}>
        {/* LEFT */}
        <Card style={{ width: 300 }}>
          <List
            dataSource={task.dataItems}
            renderItem={(item: any) => {
              const status =
                getItemStatus(item.itemId) || item.reviewStatus || "Pending";

              return (
                <List.Item
                  onClick={() => loadItem(item)}
                  style={{
                    cursor: "pointer",
                    background:
                      currentItem?.itemId === item.itemId ? "#e6f7ff" : "",
                  }}
                >
                  <Space>
                    <img
                      src={item.fileUrl}
                      style={{ width: 60, height: 60, objectFit: "cover" }}
                    />
                    <div>
                      <div>Item #{item.itemId}</div>
                      <Tag color={getStatusColor(status)}>{status}</Tag>
                    </div>
                  </Space>
                </List.Item>
              );
            }}
          />
        </Card>

        {/* RIGHT */}
        <Card style={{ flex: 1 }}>
          <div style={{ background: "#1e1e1e", borderRadius: 8 }}>
            <Stage
              width={window.innerWidth - 500}
              height={500}
              scaleX={scale}
              scaleY={scale}
              x={pos.x}
              y={pos.y}
              draggable
              ref={stageRef}
            >
              <Layer>
                {image && <KonvaImage image={image} />}

                {boxes.map((box) => (
                  <React.Fragment key={box.id}>
                    <Rect
                      {...box}
                      stroke={labelColors[box.label]}
                      strokeWidth={2}
                    />
                    <Text
                      text={box.label}
                      x={box.x}
                      y={box.y - 15}
                      fill={labelColors[box.label]}
                    />
                  </React.Fragment>
                ))}
              </Layer>
            </Stage>
          </div>

          <Divider />

          <Space>
            <Button type="primary" onClick={() => approveItem(currentItem)}>
              Approve
            </Button>

            <Button danger onClick={() => openReject(currentItem)}>
              Reject
            </Button>
          </Space>

          {currentItem && getItemComment(currentItem.itemId) && (
            <AntText type="danger">
              Lý do: {getItemComment(currentItem.itemId)}
            </AntText>
          )}
        </Card>
      </div>

      <Modal
        title="Reject Item"
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        onOk={confirmReject}
      >
        <Input.TextArea
          rows={4}
          value={errorText}
          onChange={(e) => setErrorText(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ReviewerPage;
