import React, { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Text as KonvaText,
  Line,
} from "react-konva";
import useImage from "use-image";
import { v4 as uuidv4 } from "uuid";

import {
  Layout,
  Button,
  Select,
  List,
  Space,
  Tag,
  Tooltip,
  message,
  Modal,
  Input,
} from "antd";

import {
  DragOutlined,
  BorderOutlined,
  AimOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";

import { useParams } from "react-router-dom";

import { TasksService } from "../services/task.service";
import { AnnotationService } from "../services/annotation.service";
import { LabelService } from "../services/label.service";

const { Sider, Content, Header } = Layout;

interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  labelId: number;
  annotationId?: number; // 🔥 thêm
}

type ToolMode = "select" | "draw" | "move";

const COLORS = [
  "#ff4d4f",
  "#1890ff",
  "#52c41a",
  "#faad14",
  "#722ed1",
  "#2febac",
];

const AnnotationPage: React.FC = () => {
  const { id } = useParams();

  const [task, setTask] = useState<any>(null);
  const [labels, setLabels] = useState<any[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<any>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [image] = useImage(imageUrl);

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [deletedAnnotationIds, setDeletedAnnotationIds] = useState<number[]>(
    [],
  ); // 🔥

  const [newBox, setNewBox] = useState<Box | null>(null);
  const [drawing, setDrawing] = useState(false);

  const [tool, setTool] = useState<ToolMode>("draw");
  const [selectedLabel, setSelectedLabel] = useState("");

  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const stageRef = useRef<any>(null);

  const isRejected = currentItem?.reviewStatus === "Rejected";
  const isApproved = currentItem?.reviewStatus === "Approved";
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestLabelName, setRequestLabelName] = useState("");
  const [requesting, setRequesting] = useState(false);
  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      const res = await TasksService.getTaskById(Number(id));
      setTask(res);

      const labelRes = await LabelService.getByRound(res.roundId);
      setLabels(labelRes);
      setSelectedLabel(labelRes[0]?.labelName);

      setCurrentItem(res.dataItems[0]);
      setImageUrl(res.dataItems[0].fileUrl);
    };
    if (id) load();
  }, [id]);

  /* ================= LOAD ITEM ================= */
  useEffect(() => {
    if (!task) return;

    const item = task.dataItems[currentIndex];
    setCurrentItem(item);
    setImageUrl(item.fileUrl);

    // reset deleted list khi chuyển ảnh
    setDeletedAnnotationIds([]);

    if (item.annotations) {
      const parsed = item.annotations.map((ann: any) => {
        const c = JSON.parse(ann.coordinates);
        return {
          id: c.id || uuidv4(),
          x: c.x,
          y: c.y,
          width: c.width,
          height: c.height,
          label: c.label,
          labelId: c.labelId,
          annotationId: ann.annotationId, // 🔥 quan trọng
        };
      });
      setBoxes(parsed);
    } else {
      setBoxes([]);
    }
  }, [currentIndex, task]);

  /* ================= AUTO FIT ================= */
  useEffect(() => {
    if (!image) return;

    const maxW = window.innerWidth - 500;
    const maxH = window.innerHeight - 200;

    const ratio = Math.min(maxW / image.width, maxH / image.height);

    setScale(ratio);
    setPos({ x: 20, y: 20 });
  }, [image]);

  /* ================= DRAW ================= */
  const getPointer = () => {
    const stage = stageRef.current;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(stage.getPointerPosition());
  };

  const handleMouseDown = (e: any) => {
    if (tool !== "draw" || isApproved) return;

    const posOnImage = getPointerOnImage();
    const label = labels.find((l) => l.labelName === selectedLabel);

    // Clamp tọa độ vào trong ảnh
    const x = Math.max(0, Math.min(posOnImage.x, image.width));
    const y = Math.max(0, Math.min(posOnImage.y, image.height));

    setDrawing(true);
    setNewBox({
      id: uuidv4(),
      x,
      y,
      width: 0,
      height: 0,
      label: selectedLabel,
      labelId: label?.labelId,
    });
  };

  const handleMouseMove = () => {
    if (!drawing || !newBox) return;

    const posOnImage = getPointerOnImage();

    // Tọa độ hiện tại clamp vào ảnh
    let x2 = Math.max(0, Math.min(posOnImage.x, image.width));
    let y2 = Math.max(0, Math.min(posOnImage.y, image.height));

    setNewBox({
      ...newBox,
      width: x2 - newBox.x,
      height: y2 - newBox.y,
    });
  };

  const handleMouseUp = () => {
    if (!newBox) return;

    const fixed = {
      ...newBox,
      width: Math.abs(newBox.width),
      height: Math.abs(newBox.height),
      x: newBox.width < 0 ? newBox.x + newBox.width : newBox.x,
      y: newBox.height < 0 ? newBox.y + newBox.height : newBox.y,
    };

    // Giới hạn cuối cùng vào trong ảnh
    fixed.x = Math.max(0, Math.min(fixed.x, image.width - fixed.width));
    fixed.y = Math.max(0, Math.min(fixed.y, image.height - fixed.height));

    if (fixed.width > 5 && fixed.height > 5) {
      setBoxes((prev) => [...prev, fixed]);
    }

    setDrawing(false);
    setNewBox(null);
  };
  const getPointerOnImage = () => {
    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return { x: 0, y: 0 };

    // Lấy tọa độ so với ảnh, trừ offset và chia scale
    return {
      x: (pointerPos.x - pos.x) / scale,
      y: (pointerPos.y - pos.y) / scale,
    };
  };
  /* ================= DELETE BOX ================= */
  const handleDeleteBox = (box: Box) => {
    if (box.annotationId) {
      setDeletedAnnotationIds((prev) => [...prev, box.annotationId!]);
    }

    setBoxes((prev) => prev.filter((b) => b.id !== box.id));
  };

  /* ================= COLOR ================= */
  const getColor = (labelId: number) => {
    return COLORS[labelId % COLORS.length];
  };

  const reloadCurrentItem = async () => {
    const res = await TasksService.getTaskById(Number(id));
    setTask(res);

    const item = res.dataItems[currentIndex];

    setCurrentItem(item);
    setImageUrl(item.fileUrl);

    if (item.annotations) {
      const parsed = item.annotations.map((ann: any) => {
        const c = JSON.parse(ann.coordinates);
        return {
          id: c.id || uuidv4(),
          x: c.x,
          y: c.y,
          width: c.width,
          height: c.height,
          label: c.label,
          labelId: c.labelId,
          annotationId: ann.annotationId,
        };
      });

      setBoxes(parsed);
    } else {
      setBoxes([]);
    }

    setDeletedAnnotationIds([]);
  };
  const handleSubmit = async () => {
    try {
      await Promise.all(
        deletedAnnotationIds.map((id) => AnnotationService.delete(id)),
      );

      const newBoxes = boxes.filter((b) => !b.annotationId);

      await Promise.all(
        newBoxes.map((box) =>
          AnnotationService.annotation({
            taskId: task.taskId,
            itemId: currentItem.itemId,
            roundId: task.roundId,
            labelId: box.labelId,
            shapeType: "bbox",
            coordinates: JSON.stringify(box),
          }),
        ),
      );

      message.success("Saved");
      await reloadCurrentItem();
      setDeletedAnnotationIds([]);
    } catch (err) {
      message.error("Save failed");
    }
  };

  /* ================= UI ================= */
  return (
    <Layout style={{ height: "100vh" }}>
      <Layout>
        <Header style={{ background: "#fff" }}>
          <Space>
            <Select
              value={selectedLabel}
              onChange={setSelectedLabel}
              options={labels.map((l) => ({
                label: l.labelName,
                value: l.labelName,
              }))}
            />
            <Button type="dashed" onClick={() => setRequestModalVisible(true)}>
              Request Label
            </Button>
            <Tag>
              {currentIndex + 1}/{task?.dataItems?.length}
            </Tag>

            <Tag color={isApproved ? "green" : isRejected ? "red" : "blue"}>
              {currentItem?.reviewStatus}
            </Tag>

            {isRejected && <Tag color="red">{currentItem?.errorMessage}</Tag>}
            <Button
              icon={<LeftOutlined />}
              onClick={() => setCurrentIndex((i) => i - 1)}
            />
            <Button
              icon={<RightOutlined />}
              onClick={() => setCurrentIndex((i) => i + 1)}
            />
            <Tooltip title="Select">
              <Button
                icon={<AimOutlined />}
                onClick={() => setTool("select")}
              />
            </Tooltip>
            <Tooltip title="Draw">
              <Button
                icon={<BorderOutlined />}
                onClick={() => setTool("draw")}
              />
            </Tooltip>
            <Tooltip title="Move">
              <Button icon={<DragOutlined />} onClick={() => setTool("move")} />
            </Tooltip>

            <Button
              icon={<ZoomInOutlined />}
              onClick={() => setScale((s) => s * 1.2)}
            />
            <Button
              icon={<ZoomOutOutlined />}
              onClick={() => setScale((s) => s * 0.8)}
            />

            <Button type="primary" onClick={handleSubmit}>
              Save
            </Button>
          </Space>
        </Header>

        <Content >
          <Stage
            width={window.innerWidth - 350}
            height={window.innerHeight - 120}
            scaleX={scale}
            scaleY={scale}
            x={pos.x}
            y={pos.y}
            ref={stageRef}
            draggable={tool === "move"}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
          >
            <Layer>
              {image && (
                <>
                  {/* Ảnh */}
                  <KonvaImage image={image} width={image.width} height={image.height} />

                  {/* Viền ảnh */}
                  <Rect
                    x={0}
                    y={0}
                    width={image.width}
                    height={image.height}
                    stroke="black"
                    strokeWidth={1}
                    dash={[10, 5]}
                  />


                </>
              )}

              {/* Boxes */}
              {boxes.map((box) => (
                <React.Fragment key={box.id}>
                  <Rect {...box} stroke={getColor(box.labelId)} strokeWidth={2} />
                  <KonvaText
                    text={box.label}
                    x={box.x}
                    y={box.y - 15}
                    fill={getColor(box.labelId)}
                    fontSize={10}
                  />
                  <KonvaText
                    text={`(${Math.round(box.x)}, ${Math.round(box.y)})`}
                    x={box.x + 20}
                    y={box.y - 15}
                    fill={getColor(box.labelId)}
                    fontSize={10}
                  />
                </React.Fragment>
              ))}

              {/* Box đang vẽ */}
              {newBox && <Rect {...newBox} stroke="white" dash={[4, 4]} />}
            </Layer>
          </Stage>
        </Content>
      </Layout>
      <Modal
        title="Request New Label"
        open={requestModalVisible}
        onCancel={() => setRequestModalVisible(false)}
        onOk={async () => {
          if (!requestLabelName.trim()) {
            message.warning("Input label");
            return;
          }

          try {
            setRequesting(true);
            await LabelService.requestLabel({
              roundId: task.roundId,
              labelName: requestLabelName.trim(),
            });
            message.success(`Requested label: ${requestLabelName}`);

            const updatedLabels = await LabelService.getByRound(task.roundId);
            setLabels(updatedLabels);
            if (updatedLabels.length)
              setSelectedLabel(updatedLabels[0].labelName);

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
      <Sider width={260} theme="light">
        <List
          header="Annotations"
          dataSource={boxes}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteBox(item)}
                />,
              ]}
            >
              <Tag color={getColor(item.labelId)}>{item.label}</Tag>
            </List.Item>
          )}
        />
      </Sider>
    </Layout>
  );
};

export default AnnotationPage;
