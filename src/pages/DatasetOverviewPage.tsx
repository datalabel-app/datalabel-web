import React, { useEffect, useState, useRef } from "react";
import { Card, Typography, Spin, message, Button, Space, Tag } from "antd";
import { DatasetService } from "../services/dataset.service";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface Annotation {
  annotationId: number;
  labelName: string;
  shapeType: string;
  coordinates: string;
  classification?: string | null;
  annotator: string;
  createdAt: string;
}

interface DataItem {
  itemId: number;
  fileUrl: string;
  annotations: Annotation[];
}

// Màu sắc để phân biệt annotation
const COLORS = [
  "rgba(255,0,0,0.3)",
  "rgba(0,128,255,0.3)",
  "rgba(0,255,0,0.3)",
  "rgba(255,165,0,0.3)",
  "rgba(128,0,128,0.3)",
];
const BORDER_COLORS = ["red", "blue", "green", "orange", "purple"];

const DatasetOverviewPage: React.FC = () => {
  const { datasetId } = useParams();
  const navigate = useNavigate()
  const [dataItems, setDataItems] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const imgRef = useRef<HTMLImageElement>(null);
  const [imgScale, setImgScale] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await DatasetService.getByDatasetOverview(Number(datasetId));
      setDataItems(res);
      setCurrentIndex(0);
    } catch (err) {
      message.error("Cannot load dataset overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [datasetId]);

  const currentItem = dataItems[currentIndex];

  const parseCoordinates = (coords: string) => {
    try {
      const obj = JSON.parse(coords);
      return { x: obj.x, y: obj.y, width: obj.width, height: obj.height, label: obj.label };
    } catch (err) {
      return null;
    }
  };

  // Cập nhật scale khi hình load hoặc resize
  useEffect(() => {
    const updateScale = () => {
      if (!imgRef.current) return;
      const naturalW = imgRef.current.naturalWidth;
      const naturalH = imgRef.current.naturalHeight;
      const displayedW = imgRef.current.clientWidth;
      const displayedH = imgRef.current.clientHeight;
      const scaleX = displayedW / naturalW;
      const scaleY = displayedH / naturalH;
      setImgScale(Math.min(scaleX, scaleY));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [currentItem]);

  const handlePrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));
  const handleNext = () => setCurrentIndex((i) => Math.min(i + 1, dataItems.length - 1));

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={3}>Dataset Overview</Title>
        <Text type="secondary">No data items found.</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Dataset Overview</Title>
        <Button onClick={() => navigate(-1)}>Back</Button>

      <div
        style={{
          position: "relative",
          marginTop: 20,
          width: "100%",
          maxWidth: 600,
          backgroundColor: "#f0f2f5",
          padding: 10,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <img
          ref={imgRef}
          src={currentItem.fileUrl}
          alt={`DataItem ${currentItem.itemId}`}
          style={{ width: "100%", display: "block", borderRadius: 4 }}
        />

        {/* Bounding boxes + labels */}
        {currentItem.annotations
          .filter((a) => a.coordinates)
          .map((ann, idx) => {
            const coords = parseCoordinates(ann.coordinates);
            if (!coords) return null;

            const color = COLORS[idx % COLORS.length];
            const borderColor = BORDER_COLORS[idx % BORDER_COLORS.length];

            return (
              <div key={ann.annotationId} style={{ position: "absolute", left: 0, top: 0 }}>
                {/* Box */}
                <div
                  style={{
                    position: "absolute",
                    left: `${coords.x * imgScale}px`,
                    top: `${coords.y * imgScale}px`,
                    width: `${coords.width * imgScale}px`,
                    height: `${coords.height * imgScale}px`,
                    border: `2px solid ${borderColor}`,
                    backgroundColor: color,
                    pointerEvents: "none",
                    borderRadius: 2,
                  }}
                />
                {/* Label */}
                <div
                  style={{
                    position: "absolute",
                    left: `${coords.x * imgScale}px`,
                    top: `${coords.y * imgScale - 20}px`,
                    backgroundColor: borderColor,
                    color: "#fff",
                    padding: "2px 6px",
                    fontSize: 12,
                    borderRadius: 4,
                    whiteSpace: "nowrap",
                  }}
                >
                  {coords.label}
                </div>
              </div>
            );
          })}
      </div>

      {/* Info annotation */}
      <div style={{ marginTop: 16 }}>
        {currentItem.annotations.map((ann) => {
          const coords = parseCoordinates(ann.coordinates);
          return (
            <Card key={ann.annotationId} type="inner" size="small" style={{ marginBottom: 8 }}>
              <Space direction="vertical">
                <Text strong>Label:</Text> {coords?.label || ann.labelName} <br />
             
                {coords && (
                  <>
                    <Text strong>Coordinates:</Text>{" "}
                    {`x: ${coords.x.toFixed(1)}, y: ${coords.y.toFixed(
                      1
                    )}, w: ${coords.width.toFixed(1)}, h: ${coords.height.toFixed(1)}`}{" "}
                    <br />
                  </>
                )}
                <Text type="secondary">Annotator: {ann.annotator}</Text>
                <Text type="secondary">
                  Created: {dayjs(ann.createdAt).format("DD/MM/YYYY HH:mm")}
                </Text>
                <Tag color={ann.shapeType === "bbox" ? "green" : "blue"}>
                  {ann.shapeType.toUpperCase()}
                </Tag>
              </Space>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <Space style={{ marginTop: 16 }}>
        <Button onClick={handlePrev} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Text>
          {currentIndex + 1} / {dataItems.length}
        </Text>
        <Button onClick={handleNext} disabled={currentIndex === dataItems.length - 1}>
          Next
        </Button>
      </Space>
    </div>
  );
};

export default DatasetOverviewPage;