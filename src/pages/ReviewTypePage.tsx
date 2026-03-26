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
  List,
  Divider,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { TasksService } from "../services/task.service";
import { REVIEW_STATUS } from "../constants/review-status";

const { Title, Text } = Typography;

const ReviewTypePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [rejectModal, setRejectModal] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [rejectItemId, setRejectItemId] = useState<number | null>(null);

  const [reviewMap, setReviewMap] = useState<any>({});

  // ======================
  // LOAD TASK
  // ======================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await TasksService.getReviewTask(Number(id));

        const normalizedItems = res.items.map((i: any) => ({
          ...i,
          dataItemId: i.dataItemId ?? i.itemId,
        }));

        const newTask = {
          ...res,
          items: normalizedItems,
        };

        setTask(newTask);

        if (normalizedItems.length > 0) {
          setCurrentItem(normalizedItems[0]);
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
  // HELPERS
  // ======================
  const canReview = (item: any) => {
    // nếu user đã thao tác thì vẫn cho đổi
    if (reviewMap[item.dataItemId]) return true;

    // nếu chưa approved thì được review
    return item.reviewStatus !== REVIEW_STATUS.APPROVED;
  };

  const getFinalStatus = (item: any) => {
    return reviewMap[item.dataItemId]?.status || item.reviewStatus;
  };

  const getTagColor = (status: string) => {
    switch (status) {
      case REVIEW_STATUS.APPROVED:
        return "green";
      case REVIEW_STATUS.REJECTED:
        return "red";
      case REVIEW_STATUS.ANNOTATING:
        return "gold";
      default:
        return "default";
    }
  };

  // ======================
  // APPROVE + AUTO NEXT
  // ======================
  const approveItem = (item: any) => {
    if (!canReview(item)) {
      message.warning("Item đã được review");
      return;
    }

    setReviewMap((prev: any) => ({
      ...prev,
      [item.dataItemId]: {
        status: REVIEW_STATUS.APPROVED,
        labelId: item.annotation.labelId,
      },
    }));

    goToNextItem(item.dataItemId);
  };

  // ======================
  // REJECT + AUTO NEXT
  // ======================
  const openReject = (item: any) => {
    if (!canReview(item)) {
      message.warning("Item đã được review");
      return;
    }

    setRejectItemId(item.dataItemId);
    setErrorText("");
    setRejectModal(true);
  };

  const confirmReject = () => {
    if (!errorText || rejectItemId === null) {
      message.warning("Nhập lý do");
      return;
    }

    const item = task.items.find((i: any) => i.dataItemId === rejectItemId);

    setReviewMap((prev: any) => ({
      ...prev,
      [rejectItemId]: {
        status: REVIEW_STATUS.REJECTED,
        comment: errorText,
        labelId: item?.annotation?.labelId,
      },
    }));

    setRejectModal(false);

    // tự next sang item tiếp theo
    goToNextItem(rejectItemId);
  };

  // ======================
  // NEXT ITEM
  // ======================
  const goToNextItem = (currentId: number) => {
    if (!task) return;
    const index = task.items.findIndex((i: any) => i.dataItemId === currentId);
    if (index >= 0 && index < task.items.length - 1) {
      setCurrentItem(task.items[index + 1]);
    } else {
      message.info("Đã review hết các item trong task này");
    }
  };

  // ======================
  // SUBMIT REVIEW
  // ======================
  const handleSubmitReview = async () => {
    const needReviewItems = task.items.filter(
      (i: any) => i.reviewStatus !== REVIEW_STATUS.APPROVED,
    );

    const reviewed = needReviewItems.filter(
      (i: any) => reviewMap[i.dataItemId],
    ).length;

    if (reviewed !== needReviewItems.length) {
      message.warning("Bạn chưa review hết item");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        taskId: Number(id),
        items: reviewMap,
      };

      console.log("FINAL PAYLOAD:", payload);

      const res = await TasksService.reviewBulk(payload);

      message.success(`Review success: ${res.total} items`);

      // reload
      const newData = await TasksService.getReviewTask(Number(id));
      const normalizedItems = newData.items.map((i: any) => ({
        ...i,
        dataItemId: i.dataItemId ?? i.itemId,
      }));

      setTask({
        ...newData,
        items: normalizedItems,
      });
      navigate("/tasks");
      setReviewMap({});
    } catch (err: any) {
      message.error(err?.response?.data || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // RENDER FILE
  // ======================
  const renderFile = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
      return <img src={url} style={{ width: "40%", borderRadius: 10 }} />;
    }

    if (["mp4"].includes(ext || "")) {
      return <video src={url} controls style={{ width: "50%" }} />;
    }

    if (["mp3"].includes(ext || "")) {
      return <audio controls src={url} style={{ width: "100%" }} />;
    }

    return <Tag>Unsupported</Tag>;
  };

  // ======================
  // LOADING
  // ======================
  if (loading || !task) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }
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
  // ======================
  // UI
  // ======================
  return (
    <div style={{ padding: 30 }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3}>Review Task #{task.taskId}</Title>

        <Button
          type="primary"
          onClick={handleSubmitReview}
          disabled={
            task.items.filter(
              (i: any) => i.reviewStatus !== REVIEW_STATUS.APPROVED,
            ).length === 0 || Object.keys(reviewMap).length === 0
          }
        >
          Submit Review
        </Button>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        {/* LEFT */}
        <Card style={{ width: 320 }}>
          <Title level={5}>Data Items</Title>

          <List
            dataSource={task.items}
            renderItem={(item: any) => {
              const finalStatus = getFinalStatus(item);

              return (
                <List.Item
                  onClick={() => setCurrentItem(item)}
                  style={{
                    cursor: "pointer",
                    background:
                      currentItem?.dataItemId === item.dataItemId
                        ? "#e6f7ff"
                        : "",
                  }}
                >
                  <Space>
                    {renderThumbnail(item.fileUrl)}

                    <div>
                      <Text>Item #{item.dataItemId}</Text>
                      <br />
                      <Tag color={getTagColor(finalStatus)}>{finalStatus}</Tag>
                    </div>
                  </Space>
                </List.Item>
              );
            }}
          />
        </Card>

        {/* RIGHT */}
        <Card style={{ flex: 1 }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {currentItem && renderFile(currentItem.fileUrl)}

            <Divider />

            <div>
              <Title level={5}>Classification</Title>
              {currentItem?.annotation ? (
                <Tag color="blue">{currentItem.annotation.labelName}</Tag>
              ) : (
                <Tag color="red">No annotation</Tag>
              )}
            </div>

            <Space>
              <Button
                type="primary"
                disabled={!canReview(currentItem)}
                onClick={() => approveItem(currentItem)}
              >
                Approve
              </Button>

              <Button
                danger
                disabled={!canReview(currentItem)}
                onClick={() => openReject(currentItem)}
              >
                Reject
              </Button>
            </Space>

            {(reviewMap[currentItem?.dataItemId]?.comment ||
              currentItem?.reviewComment) && (
                <Text type="danger">
                  Lý do:{" "}
                  {reviewMap[currentItem.dataItemId]?.comment ||
                    currentItem.reviewComment}
                </Text>
              )}
          </Space>
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

export default ReviewTypePage;
