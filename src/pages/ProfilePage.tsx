import React, { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Text as KonvaText,
  Transformer,
} from "react-konva";
import useImage from "use-image";
import { v4 as uuidv4 } from "uuid";

import {
  Layout,
  Button,
  Select,
  List,
  Typography,
  Space,
  Card,
  Tag,
  message,
  Alert,
  Modal,
  Input,
} from "antd";

import {
  DragOutlined,
  BorderOutlined,
  AimOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";

import { TasksService } from "../services/task.service";
import { AnnotationService } from "../services/annotation.service";
import { LabelService } from "../services/label.service";

const { Sider, Content } = Layout;
const { Text } = Typography;

interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  labelId: number;
}

type ToolMode = "select" | "draw" | "move";

const AnnotationPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [image] = useImage(imageUrl);

  const [task, setTask] = useState<any>(null);
  const [labels, setLabels] = useState<any[]>([]);

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [newBox, setNewBox] = useState<Box | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState("");

  const [tool, setTool] = useState<ToolMode>("draw");

  const [reviewError, setReviewError] = useState<string | null>(null);

  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  /* ================= LOAD TASK ================= */

  useEffect(() => {
    const loadTask = async () => {
      try {
        const res = await TasksService.getTaskById(Number(id));

        setTask(res);
        setImageUrl(res.fileUrl);

        if (res.status === 3 && res.descriptionError) {
          setReviewError(res.descriptionError);
        }

        /* LOAD LABEL */

        const labelRes = await LabelService.getByRound(res.round.roundId);
        setLabels(labelRes);

        if (labelRes.length) {
          setSelectedLabel(labelRes[0].labelName);
        }

        /* ================= LOAD ANNOTATION ================= */

        const annotationRes = await AnnotationService.getByTaskId(res.taskId);

        if (annotationRes && annotationRes.length) {
          const restored: Box[] = [];

          annotationRes.forEach((ann: any) => {
            const coords = JSON.parse(ann.coordinates);

            const label = labelRes.find((l: any) => l.labelId === ann.labelId);

            if (Array.isArray(coords)) {
              coords.forEach((c: any) => {
                restored.push({
                  id: uuidv4(),
                  x: c.x,
                  y: c.y,
                  width: c.width,
                  height: c.height,
                  label: label?.labelName || "",
                  labelId: ann.labelId,
                });
              });
            } else {
              restored.push({
                id: uuidv4(),
                x: coords.x,
                y: coords.y,
                width: coords.width,
                height: coords.height,
                label: label?.labelName || "",
                labelId: ann.labelId,
              });
            }
          });

          setBoxes(restored);
        }
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.message ||
          error?.response?.data?.title ||
          error?.message ||
          "Load task failed";

        message.error(errMsg);
      }
    };

    if (id) loadTask();
  }, [id]);

  /* ================= LABEL COLORS ================= */

  const labelColors: Record<string, string> = {};

  labels.forEach((l, i) => {
    const colors = ["#22c55e", "#3b82f6", "#f97316", "#ef4444"];
    labelColors[l.labelName] = colors[i % colors.length];
  });

  /* ================= DRAW ================= */

  const getRelativePointerPosition = () => {
    const stage = stageRef.current;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    return transform.point(pos);
  };

  const handleWheel = (e: any) => {
    console.log(e.evt.deltaY);
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.1;
    const direction = e.evt.deltaY > 0 ? 1 / scaleBy : scaleBy;
    const newScale = Math.max(0.2, Math.min(5, oldScale * direction));

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };

    setStagePosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
    setStageScale(newScale);
  };

  const handleRequestLabel = async () => {
    if (!newLabel.trim()) {
      message.warning("Please enter label name");
      return;
    }

    try {
      setLoadingRequest(true);

      await LabelService.requestLabel({
        roundId: task.round.roundId,
        labelName: newLabel.trim(),
      });

      message.success("Request sent! Waiting for approval");

      setNewLabel("");
      setIsModalOpen(false);

      const labelRes = await LabelService.getByRound(task.round.roundId);
      setLabels(labelRes);
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Request failed";

      message.error(errMsg);
    } finally {
      setLoadingRequest(false);
    }
  };

  const handleMouseDown = (e: any) => {
    if (tool !== "draw") return;

    if (e.target.getClassName() === "Rect") return;

    const pos = getRelativePointerPosition();

    const label = labels.find((l) => l.labelName === selectedLabel);

    setDrawing(true);

    setNewBox({
      id: uuidv4(),
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      label: selectedLabel,
      labelId: label?.labelId,
    });
  };

  const handleMouseMove = () => {
    if (!drawing || !newBox) return;

    const pos = getRelativePointerPosition();

    setNewBox({
      ...newBox,
      width: pos.x - newBox.x,
      height: pos.y - newBox.y,
    });
  };

  const handleMouseUp = () => {
    if (!newBox) return;

    const fixed = {
      ...newBox,
      x: newBox.width < 0 ? newBox.x + newBox.width : newBox.x,
      y: newBox.height < 0 ? newBox.y + newBox.height : newBox.y,
      width: Math.abs(newBox.width),
      height: Math.abs(newBox.height),
    };

    if (fixed.width > 5 && fixed.height > 5) {
      setBoxes((prev) => [...prev, fixed]);
    }

    setDrawing(false);
    setNewBox(null);
  };

  /* ================= DELETE ================= */

  const deleteSelected = () => {
    if (!selectedId) return;

    setBoxes((prev) => prev.filter((b) => b.id !== selectedId));
    setSelectedId(null);
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!task) return;

    if (boxes.length === 0) {
      message.warning("Please draw at least one box");
      return;
    }

    try {
      /* ================= LẤY ANNOTATION CŨ ================= */

      const oldAnnotations = await AnnotationService.getByTaskId(task.taskId);

      /* ================= DELETE ANNOTATION CŨ ================= */

      if (oldAnnotations && oldAnnotations.length) {
        for (const ann of oldAnnotations) {
          await AnnotationService.delete(ann.annotationId);
        }
      }

      /* ================= CREATE LẠI THEO BOXES ================= */

      for (const box of boxes) {
        await AnnotationService.annotation({
          taskId: task.taskId,
          itemId: task.itemId,
          roundId: task.round.roundId,
          labelId: box.labelId,
          shapeType: "bbox",
          coordinates: JSON.stringify({
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
          }),
        });
      }

      message.success("Annotation saved");
      navigate("/tasks");
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.message ||
        "Save failed";

      message.error(errMsg);
    }
  };

  /* ================= TRANSFORM ================= */

  useEffect(() => {
    const stage = stageRef.current;
    const node = stage?.findOne(`#${selectedId}`);

    transformerRef.current?.nodes(node ? [node] : []);
    transformerRef.current?.getLayer()?.batchDraw();
  }, [selectedId, boxes]);

  /* ================= UI ================= */

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider width={80} theme="dark">
        <Space
          direction="vertical"
          style={{ width: "100%", alignItems: "center", marginTop: 20 }}
        >
          <Button
            icon={<AimOutlined />}
            type={tool === "select" ? "primary" : "text"}
            onClick={() => setTool("select")}
            style={{ color: "white" }}
          />

          <Button
            icon={<BorderOutlined />}
            type={tool === "draw" ? "primary" : "text"}
            onClick={() => setTool("draw")}
            style={{ color: "white" }}
          />

          <Button
            icon={<DragOutlined />}
            type={tool === "move" ? "primary" : "text"}
            onClick={() => setTool("move")}
            style={{ color: "white" }}
          />
        </Space>
      </Sider>

      <Content style={{ padding: 16 }}>
        {reviewError && (
          <Alert
            message="Reviewer feedback"
            description={reviewError}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Card style={{ marginBottom: 12 }}>
          <Space>
            <Select
              value={selectedLabel}
              onChange={setSelectedLabel}
              style={{ width: 160 }}
              options={labels.map((l) => ({
                label: l.labelName,
                value: l.labelName,
              }))}
            />

            <Tag color="processing">{tool.toUpperCase()}</Tag>
            <Button onClick={() => setIsModalOpen(true)}>Request Label</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save Annotation
            </Button>
          </Space>
        </Card>

        <Stage
          width={window.innerWidth - 420}
          height={window.innerHeight - 160}
          ref={stageRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheelCapture={handleWheel}
          draggable={tool === "move"}
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Layer>
            {image && <KonvaImage image={image} />}

            {boxes.map((box) => (
              <React.Fragment key={box.id}>
                <Rect
                  id={box.id}
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  stroke={labelColors[box.label]}
                  strokeWidth={2}
                  draggable={tool === "select"}
                  onClick={() => setSelectedId(box.id)}
                />

                <KonvaText
                  text={box.label}
                  x={box.x}
                  y={box.y - 18}
                  fill={labelColors[box.label]}
                  fontSize={14}
                  fontStyle="bold"
                />
              </React.Fragment>
            ))}

            {newBox && (
              <Rect
                x={newBox.x}
                y={newBox.y}
                width={newBox.width}
                height={newBox.height}
                stroke="#94a3b8"
                dash={[4, 4]}
              />
            )}

            <Transformer ref={transformerRef} />
          </Layer>
        </Stage>
      </Content>

      <Sider width={260} theme="light" style={{ padding: 16 }}>
        <Text strong>Objects</Text>

        <List
          dataSource={boxes}
          style={{ marginTop: 10 }}
          renderItem={(item) => (
            <List.Item
              onClick={() => setSelectedId(item.id)}
              style={{
                cursor: "pointer",
                background: item.id === selectedId ? "#e0f2fe" : "transparent",
              }}
              actions={[
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={deleteSelected}
                />,
              ]}
            >
              <Tag color={labelColors[item.label]}>{item.label}</Tag>
            </List.Item>
          )}
        />
      </Sider>
      <Modal
        title="Request New Label"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleRequestLabel}
        confirmLoading={loadingRequest}
        okText="Send Request"
      >
        <Input
          placeholder="Enter label name (e.g. Car, Person...)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
      </Modal>
    </Layout>
  );
};

export default AnnotationPage;
