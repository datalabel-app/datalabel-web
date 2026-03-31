import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Table,
  Spin,
  message,
  Tag,
  Modal,
  Space,
  Select,
  Input,
  Radio,
  Col,
} from "antd";

import {
  ArrowLeftOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import { DataItemService } from "../services/dataitem.service";
import { DatasetService } from "../services/dataset.service";
import { TasksService } from "../services/task.service";
import { UserService } from "../services/user.service";
import { LabelService } from "../services/label.service";
import { DatasetRoundService } from "../services/datasetround.service";
import { saveAs } from "file-saver";
import { DatePicker } from "antd";
import dayjs from "dayjs";
const { Title } = Typography;

const { confirm } = Modal;
const DatasetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { datasetId } = useParams();

  const [dataItems, setDataItems] = useState<any[]>([]);
  const [dataset, setDataset] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [annotators, setAnnotators] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);

  const [selectedAnnotator, setSelectedAnnotator] = useState<number>();
  const [selectedReviewer, setSelectedReviewer] = useState<number>();

  const [description, setDescription] = useState("");
  const [labels, setLabels] = useState<any[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<number | null>(null);

  const [newLabel, setNewLabel] = useState("");
  const [shapeType, setShapeType] = useState<number>(0);
  const [creating, setCreating] = useState(false);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [round, setRound] = useState<any>(null);

  const [unassignedItems, setUnassignedItems] = useState<any[]>([]);
  const [selectionMode, setSelectionMode] = useState<"all" | "number">("all");
  const [numberInput, setNumberInput] = useState<number>(0);
  const hasRound = !!round;

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      setLoadingData(true);

      const datasetRes = await DatasetService.getById(Number(datasetId));
      const items = await DataItemService.getByDataset(Number(datasetId));

      setDataset(datasetRes);
      setDataItems(items || []);
    } catch {
      message.error("Load dataset failed");
    } finally {
      setLoadingData(false);
    }
  };
  const fetchLabels = async () => {
    try {
      if (!datasetId) return;

      setLoadingLabels(true);

      setLabels([]);
      setRound(null);

      const datasetRes = await DatasetService.getById(Number(datasetId));
      setDataset(datasetRes);

      if (!datasetRes?.parentDatasetId) {
        const labelsRes = await DatasetService.getLabelByDatasetRoot(
          Number(datasetId),
        );

        setLabels(labelsRes || []);
        return;
      }

      const roundRes = await DatasetRoundService.getByDataset(
        Number(datasetId),
      );

      if (roundRes && roundRes.length > 0) {
        const round = roundRes[0];
        setRound(round);

        setLabels(round.labels || []);
      } else {
        setLabels([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLabels(false);
    }
  };

  useEffect(() => {
    if (!datasetId) return;

    const load = async () => {
      await Promise.all([fetchData(), fetchLabels()]);
    };

    load();
  }, [datasetId]);

  // ================= CREATE TASK =================
  const handleCreateTask = async () => {
    try {
      setLoadingCreate(true);
      const [annoRes, reviRes, unassigned, roundRes] = await Promise.all([
        UserService.getAnnotator(),
        UserService.getReviewer(),
        DataItemService.getByDatasetUnassigned(Number(datasetId)),
        DatasetRoundService.getByDataset(Number(datasetId)),
      ]);

      if (!unassigned.length) {
        message.warning("No items remain unassigned.");
        return;
      }

      setAnnotators(annoRes || []);
      setReviewers(reviRes || []);
      setUnassignedItems(unassigned);

      if (roundRes && roundRes.length > 0) {
        setRound(roundRes[0]);
      } else {
        setRound(null);
      }

      setSelectionMode("all");
      setNumberInput(0);

      setCreateModal(true);
    } catch {
      message.error("Load data failed");
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    setLabels([...labels, newLabel]);
    setNewLabel("");
  };

  const getSelectedItems = () => {
    if (selectionMode === "all") {
      return unassignedItems.map((i) => i.itemId);
    }

    if (numberInput <= 0) return [];

    return unassignedItems.slice(0, numberInput).map((i) => i.itemId);
  };

  const handleSubmitCreateTask = async () => {
    if (!selectedAnnotator || !selectedReviewer) {
      message.warning("Choose annotator & reviewer");
      return;
    }

    const selectedItems = getSelectedItems();

    if (!selectedItems.length) {
      message.warning("Empty Item select");
      return;
    }
    if (!deadline) {
  message.warning("Please select deadline");
  return;
} 
if(labels.length === 0) {
    message.warning("Please add labels");
  return;
}

    try {
      setCreating(true);

      let roundId = round?.roundId;

      // 🔥 CREATE ROUND + LABEL + DATASET
      if (!hasRound) {
        const roundRes = await DatasetRoundService.create({
          datasetId: Number(datasetId),
          description: description,
          roundNumber: 1,
          shapeType: shapeType,
        });

        roundId = roundRes.roundId;

        // 🔥 FIX CHÍNH Ở ĐÂY
        for (const label of labels) {
          await LabelService.create({
            roundId: roundId,
            labelName: label,

            // 👇 truyền thêm theo yêu cầu bạn
            projectId: dataset?.project?.projectId,
            parentDatasetId: dataset?.datasetId,
          });
        }
      }

      await TasksService.create({
        roundId: roundId,
        annotatorId: selectedAnnotator,
        reviewerId: selectedReviewer,
        dataItemIds: selectedItems,
         deadline: deadline,
      });

      message.success(`Create task for ${selectedItems.length} items`);

      setCreateModal(false);
      fetchData();
    } catch {
      message.error("Create task fail");
    } finally {
      setCreating(false);
    }
  };
  const handleDeleteDataset = async () => {
    confirm({
      title: "Confirm delete dataset",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this dataset?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await DatasetService.delete(Number(datasetId));
          message.success("Delete dataset success");
          navigate(-1);
        } catch {
          message.error("Delete dataset fail");
        }
      },
    });
  };
  const renderFile = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
      return <img src={url} style={{ width: "10%", borderRadius: 10 }} />;
    }

    if (["mp4"].includes(ext || "")) {
      return <video src={url} controls style={{ width: "10%" }} />;
    }

    if (["mp3"].includes(ext || "")) {
      return <audio controls src={url} style={{ width: "100%" }} />;
    }

    return <Tag>Unsupported</Tag>;
  };
  const loading = loadingData || loadingLabels;
  // ================= TABLE =================

const columns: any = [
 {
    title: "File",
    dataIndex: "fileUrl",
    render: (url: string) => renderFile(url),
  },
  ...(!dataset?.parentDatasetId
    ? [
        {
          title: "Label Count",
          dataIndex: "labelCount",
          key: "labelCount",
          align: "center",
          render: (count: number) => <b>{count}</b>,
        },
        {
          title: "Labels",
          dataIndex: "labels",
          key: "labels",
          render: (labels: string[]) => (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {labels.map((label) => (
                <Tag color="blue" key={label}>
                  {label}
                </Tag>
              ))}
            </div>
          ),
        },
      ]
    : []),
];

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  const handleExportDataset = async () => {
    if (!datasetId) return;

    const hide = message.loading("Exporting dataset...", 0);

    try {
      const data = await DatasetService.exportDataset(Number(datasetId));

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, `${dataset.datasetName || "dataset"}_export.json`);

      message.success("Export success!");
    } catch (error) {
      console.error(error);
      message.error("Export fail!");
    } finally {
      hide(); // hide loading
    }
  };
  const handleLabelFilterChange = (labelId: number | null) => {
    setSelectedLabel(labelId);

    const selected = labels.find((l: any) => l.labelId === labelId);

    if (selected?.datasetId) {
      navigate(`/datasets/${selected.datasetId}`);
      setSelectedLabel(null);
    }

    fetchData();
  };
  return (
    <div style={{ padding: 24 }}>
      <Button
        onClick={() => navigate(`/projects/${dataset?.project?.projectId}`)}
        icon={<ArrowLeftOutlined />}
      >
        Back
      </Button>

      <Card style={{ marginTop: 10 }}>
        <Row justify="space-between">
          <Title level={4}>{dataset?.datasetName}</Title>
          <Col style={{ display: "flex", gap: 12 }}>
          
           <Button
  type="primary" 
  icon={<EyeOutlined />}
  style={{ marginLeft: 8 }}
  onClick={() => navigate(`/dataset-overview/${datasetId}`)}
>
  Overview
</Button>
            {!dataset?.parentDatasetId && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
                onClick={handleExportDataset}
              >
                Export Data
              </Button>
            )}

            <Button danger onClick={handleDeleteDataset}>
              Delete Dataset
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateTask}
              loading={loadingCreate}
            >
              Create Task
            </Button>
          </Col>
        </Row>
        <div style={{ marginTop: 16 }}>
          <span>Filter by Label: </span>
          {loadingLabels ? (
            <Spin size="small" />
          ) : (
            <Select
              key={datasetId}
              placeholder="Select label"
              allowClear
              style={{ width: 200 }}
              value={selectedLabel || undefined}
              onChange={handleLabelFilterChange}
            >
              {labels.map((l) => (
                <Select.Option key={l.labelId} value={l.labelId}>
                  {l.labelName}
                </Select.Option>
              ))}
            </Select>
          )}
        </div>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <Table rowKey="itemId" columns={columns} dataSource={dataItems} />
      </Card>

      {/* ================= MODAL ================= */}
      <Modal
        title="Create Task"
        open={createModal}
        onCancel={() => setCreateModal(false)}
        onOk={handleSubmitCreateTask}
        confirmLoading={creating}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {/* PICK */}
          <Radio.Group
            value={selectionMode}
            onChange={(e) => setSelectionMode(e.target.value)}
          >
            <Radio value="all">Pick All</Radio>
            <Radio value="number">Pick quantity</Radio>
          </Radio.Group>

          {selectionMode === "number" && (
            <Input
              type="number"
              placeholder="Nhập số item"
              value={numberInput}
              onChange={(e) => setNumberInput(Number(e.target.value))}
            />
          )}

          {/* ROUND VIEW */}
          {hasRound ? (
            <>
              <div>
                <b>Round Description:</b> {round.description}
              </div>

              <div>
                <b>Labels:</b>
                <div style={{ marginTop: 8 }}>
                  {round.labels?.map((l: any) => (
                    <Tag key={l.labelId}>{l.labelName}</Tag>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>Round Description</div>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div>Round Type</div>
              <Select
                style={{ width: "100%" }}
                value={shapeType}
                onChange={(value) => setShapeType(value)}
              >
                <Select.Option value={0}>Bounding Box</Select.Option>
                <Select.Option value={1}>Classification</Select.Option>
              </Select>

              <div>Labels</div>
              <Space>
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <Button onClick={handleAddLabel}>Add</Button>
              </Space>

             <div style={{ marginTop: 10 }}>
  {labels.map((l, i) => (
    <Tag
      key={i}
      closable
      onClose={() => {
        setLabels((prev) => prev.filter((label) => label !== l));
      }}
    >
      {l}
    </Tag>
  ))}
</div>
            </>
          )}
          <div>
  <div>Deadline</div>
 <DatePicker
  showTime
  style={{ width: "100%" }}
  disabledDate={(current) =>
    current && current < dayjs().startOf("day")
  }
  disabledTime={(current) => {
    if (!current) return {};

    const now = dayjs();

    // nếu chọn đúng ngày hôm nay → khóa giờ quá khứ
    if (current.isSame(now, "day")) {
      return {
        disabledHours: () =>
          Array.from({ length: now.hour() }, (_, i) => i),

        disabledMinutes: (selectedHour) => {
          if (selectedHour === now.hour()) {
            return Array.from({ length: now.minute() }, (_, i) => i);
          }
          return [];
        },

        disabledSeconds: (selectedHour, selectedMinute) => {
          if (
            selectedHour === now.hour() &&
            selectedMinute === now.minute()
          ) {
            return Array.from({ length: now.second() }, (_, i) => i);
          }
          return [];
        },
      };
    }

    return {};
  }}
  onChange={(value) => {
    setDeadline(value ? value.toISOString() : null);
  }}
/>
</div>

          {/* SELECT USER */}
          <div>
            <div>Annotator</div>
            <Select
              placeholder="Select annotator"
              style={{ width: "100%", minHeight: 40 }}
              onChange={(v) => setSelectedAnnotator(v)}
            >
              {annotators.map((u) => (
                <Select.Option key={u.userId} value={u.userId}>
                  {u.fullName}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <div>Reviewer</div>
            <Select
              placeholder="Select reviewer"
              style={{ width: "100%", minHeight: 40 }}
              onChange={(v) => setSelectedReviewer(v)}
            >
              {reviewers.map((u) => (
                <Select.Option key={u.userId} value={u.userId}>
                  {u.fullName}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <b>
              {selectionMode === "all"
                ? unassignedItems.length
                : Math.min(numberInput, unassignedItems.length)}
            </b>{" "}
            items sẽ được tạo task
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default DatasetDetailPage;
