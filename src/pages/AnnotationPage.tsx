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
}

type ToolMode = "select" | "draw" | "move";

const AnnotationPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  /* ================= LOAD TASK ================= */

  useEffect(() => {
    const loadTask = async () => {
      try {
        const res = await TasksService.getTaskById(Number(id));

        setTask(res);
        setImageUrl(res.fileUrl);

        const labelRes = await LabelService.getByRound(res.round.roundId);

        setLabels(labelRes);

        if (labelRes.length) setSelectedLabel(labelRes[0].labelName);
      } catch {
        message.error("Cannot load task");
      }
    };

    if (id) loadTask();
  }, [id]);

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

  const handleMouseDown = (e: any) => {
    if (tool !== "draw") return;
    if (e.target.getClassName() === "Rect") return;

    const pos = getRelativePointerPosition();

    setDrawing(true);
    setNewBox({
      id: uuidv4(),
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      label: selectedLabel,
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
    try {
      for (const box of boxes) {
        const label = labels.find((l) => l.labelName === box.label);

        await AnnotationService.annotation({
          taskId: task.taskId,
          itemId: task.itemId,
          roundId: task.round.roundId,
          labelId: label.labelId,
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
    } catch {
      message.error("Save failed");
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
      {/* LEFT TOOLBAR */}

      <Sider width={80} theme="dark">
        <Space
          direction="vertical"
          style={{ width: "100%", alignItems: "center", marginTop: 20 }}
        >
          <Button
            icon={<AimOutlined />}
            type={tool === "select" ? "primary" : "text"}
            onClick={() => setTool("select")}
          />

          <Button
            icon={<BorderOutlined />}
            type={tool === "draw" ? "primary" : "text"}
            onClick={() => setTool("draw")}
          />

          <Button
            icon={<DragOutlined />}
            type={tool === "move" ? "primary" : "text"}
            onClick={() => setTool("move")}
          />
        </Space>
      </Sider>

      {/* MAIN */}

      <Content style={{ padding: 16 }}>
        <Card style={{ marginBottom: 12 }}>
          <Space>
            <Select
              value={selectedLabel}
              onChange={setSelectedLabel}
              options={labels.map((l) => ({
                label: l.labelName,
                value: l.labelName,
              }))}
              style={{ width: 160 }}
            />

            <Tag color="processing">{tool.toUpperCase()}</Tag>

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

      {/* RIGHT PANEL */}

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
    </Layout>
  );
};

export default AnnotationPage;
