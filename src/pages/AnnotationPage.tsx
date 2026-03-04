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
} from "antd";
import {
  DragOutlined,
  BorderOutlined,
  AimOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

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

const labels = ["Person", "Car", "Bike"];

const labelColors: Record<string, string> = {
  Person: "#22c55e",
  Car: "#3b82f6",
  Bike: "#f97316",
};

const AnnotationPage: React.FC = () => {
  const [image] = useImage("https://picsum.photos/1200/700");
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [newBox, setNewBox] = useState<Box | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState("Person");
  const [tool, setTool] = useState<ToolMode>("draw");

  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  /* ---------------- FIX CLICK LỆCH KHI ZOOM ---------------- */
  const getRelativePointerPosition = () => {
    const stage = stageRef.current;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    return transform.point(pos);
  };

  /* ---------------- ZOOM ---------------- */
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const scaleBy = 1.05;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
    stage.batchDraw();
  };

  /* ---------------- DRAW ---------------- */
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

    const fixedBox = {
      ...newBox,
      x: newBox.width < 0 ? newBox.x + newBox.width : newBox.x,
      y: newBox.height < 0 ? newBox.y + newBox.height : newBox.y,
      width: Math.abs(newBox.width),
      height: Math.abs(newBox.height),
    };

    if (fixedBox.width > 5 && fixedBox.height > 5) {
      setBoxes((prev) => [...prev, fixedBox]);
    }

    setDrawing(false);
    setNewBox(null);
  };

  /* ---------------- DELETE ---------------- */
  const deleteSelected = () => {
    if (!selectedId) return;

    setBoxes((prev) => prev.filter((b) => b.id !== selectedId));
    transformerRef.current?.nodes([]);
    transformerRef.current?.getLayer()?.batchDraw();
    setSelectedId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        deleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  /* ---------------- TRANSFORMER ---------------- */
  useEffect(() => {
    const stage = stageRef.current;
    const selectedNode = stage?.findOne(`#${selectedId}`);
    transformerRef.current?.nodes(selectedNode ? [selectedNode] : []);
    transformerRef.current?.getLayer().batchDraw();
  }, [selectedId, boxes]);

  return (
    <Layout style={{ height: "100vh", background: "#f1f5f9" }}>
      {/* LEFT TOOLBAR */}
      <Sider width={80} theme="dark" style={{ paddingTop: 20 }}>
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", alignItems: "center" }}
        >
          <Button
            type={tool === "select" ? "primary" : "text"}
            shape="circle"
            icon={<AimOutlined />}
            onClick={() => setTool("select")}
            style={{
              color: "#fff",
            }}
          />
          <Button
            type={tool === "draw" ? "primary" : "text"}
            shape="circle"
            icon={<BorderOutlined />}
            onClick={() => setTool("draw")}
            style={{
              color: "#fff",
            }}
          />
          <Button
            type={tool === "move" ? "primary" : "text"}
            shape="circle"
            icon={<DragOutlined />}
            onClick={() => setTool("move")}
            style={{
              color: "#fff",
            }}
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
              options={labels.map((l) => ({ label: l, value: l }))}
              style={{ width: 150 }}
            />
            <Tag color="processing">{tool.toUpperCase()} MODE</Tag>
          </Space>
        </Card>

        <Stage
          width={window.innerWidth - 400}
          height={window.innerHeight - 140}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          draggable={tool === "move"}
          ref={stageRef}
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Layer>
            {image && <KonvaImage image={image} />}

            {boxes.map((box) => {
              const color = labelColors[box.label];
              return (
                <React.Fragment key={box.id}>
                  <Rect
                    id={box.id}
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    stroke={color}
                    strokeWidth={2}
                    draggable={tool === "select"}
                    onClick={() => tool === "select" && setSelectedId(box.id)}
                    onDragEnd={(e) => {
                      const { x, y } = e.target.position();
                      setBoxes((prev) =>
                        prev.map((b) => (b.id === box.id ? { ...b, x, y } : b)),
                      );
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();

                      node.scaleX(1);
                      node.scaleY(1);

                      setBoxes((prev) =>
                        prev.map((b) =>
                          b.id === box.id
                            ? {
                                ...b,
                                x: node.x(),
                                y: node.y(),
                                width: Math.max(5, node.width() * scaleX),
                                height: Math.max(5, node.height() * scaleY),
                              }
                            : b,
                        ),
                      );
                    }}
                  />
                  <KonvaText
                    text={box.label}
                    x={box.x}
                    y={box.y - 18}
                    fill={color}
                    fontSize={14}
                    fontStyle="bold"
                  />
                </React.Fragment>
              );
            })}

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
          style={{ marginTop: 12 }}
          dataSource={boxes}
          renderItem={(item) => (
            <List.Item
              onClick={() => setSelectedId(item.id)}
              style={{
                cursor: "pointer",
                background: item.id === selectedId ? "#e0f2fe" : "transparent",
              }}
              actions={[
                item.id === selectedId && (
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={deleteSelected}
                  />
                ),
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
