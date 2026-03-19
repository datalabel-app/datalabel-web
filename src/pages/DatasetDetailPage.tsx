import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Input,
  Table,
  Spin,
  message,
  Tag,
  Select,
  Modal,
  Space,
  Divider,
} from "antd";

import {
  ArrowLeftOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  ExportOutlined,
  CopyOutlined,
  DownloadOutlined,
  BugOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";

import { DataItemService } from "../services/dataitem.service";
import { DatasetRoundService } from "../services/datasetround.service";
import { UserService } from "../services/user.service";
import { TasksService } from "../services/task.service";
import { ExportService } from "../services/export.service";
import { ErrorHistoryService } from "../services/error-history.service";
import dayjs from "dayjs";
import { DatasetService } from "../services/dataset.service";
import { LabelService } from "../services/label.service";

const { Title, Text } = Typography;

interface DataItem {
  itemId: number;
  fileUrl: string;
  status: string;
  annotatorName: string;
  reviewerName: string;
}

interface Task {
  taskId: number;
  dataItemId: number;
  roundId: number;
  annotator?: { fullName: string };
  reviewer?: { fullName: string };
  annotatorName: string;
  reviewerName: string;
  status: string;
  labels: any;
}

interface Round {
  roundId: number;
  roundNumber: number;
}

interface User {
  userId: number;
  fullName: string;
}

interface TableItem {
  key: number;
  itemId: number;
  fileUrl: string;
  status: string;
  annotatorName?: string;
  reviewerName?: string;
}

const DatasetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { datasetId } = useParams();
  const [roundLabels, setRoundLabels] = useState<
    { labelName: string; labelId: number }[]
  >([]);
  const [selectedLabel, setSelectedLabel] = useState<number | undefined>();
  const [dataItems, setDataItems] = useState<DataItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [annotators, setAnnotators] = useState<User[]>([]);
  const [reviewers, setReviewers] = useState<User[]>([]);

  const [selectedRound, setSelectedRound] = useState<number | undefined>();
  const [selectedAnnotator, setSelectedAnnotator] = useState<number>();
  const [selectedReviewer, setSelectedReviewer] = useState<number>();

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [errorModal, setErrorModal] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [errorLoading, setErrorLoading] = useState(false);

  const [exportModal, setExportModal] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingDataset, setEditingDataset] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [dataset, setDataset] = useState<any>(null);
  const [editRounds, setEditRounds] = useState<
    {
      roundNumber: number;
      description: string;
      shapeType: number;
      labels: { labelName: string }[];
    }[]
  >([]);
  const [maxRoundNumber, setMaxRoundNumber] = useState(0);

  // ADD ROUND
  const addEditRound = () => {
    const newNumber = maxRoundNumber + 1;
    setMaxRoundNumber(newNumber);

    setEditRounds([
      ...editRounds,
      {
        roundNumber: newNumber,
        description: "",
        shapeType: 0,
        labels: [],
      },
    ]);
  };

  // REMOVE ROUND
  const removeEditRound = (index: number) => {
    const newRounds = [...editRounds];
    newRounds.splice(index, 1);
    setEditRounds(newRounds);
  };

  // UPDATE ROUND DESCRIPTION
  const updateEditRoundDescription = (index: number, value: string) => {
    const newRounds = [...editRounds];
    newRounds[index].description = value;
    setEditRounds(newRounds);
  };

  // UPDATE SHAPETYPE
  const updateEditShapeType = (index: number, value: number) => {
    const newRounds = [...editRounds];
    newRounds[index].shapeType = value;
    setEditRounds(newRounds);
  };

  // ADD LABEL
  const addEditLabel = (roundIndex: number) => {
    const newRounds = [...editRounds];
    newRounds[roundIndex].labels.push({ labelName: "" });
    setEditRounds(newRounds);
  };

  // UPDATE LABEL
  const updateEditLabel = (
    roundIndex: number,
    labelIndex: number,
    value: string,
  ) => {
    const newRounds = [...editRounds];
    newRounds[roundIndex].labels[labelIndex].labelName = value;
    setEditRounds(newRounds);
  };

  // REMOVE LABEL
  const removeEditLabel = (roundIndex: number, labelIndex: number) => {
    const newRounds = [...editRounds];
    newRounds[roundIndex].labels.splice(labelIndex, 1);
    setEditRounds(newRounds);
  };
  const fetchData = async () => {
    try {
      setLoading(true);

      const datasetRes = await DatasetService.getById(Number(datasetId));
      const items = await DataItemService.getByDataset(Number(datasetId));
      const roundRes = await DatasetRoundService.getByDataset(
        Number(datasetId),
      );
      const annotatorRes = await UserService.getAnnotator();
      const reviewerRes = await UserService.getReviewer();

      setDataset(datasetRes);
      setDataItems(items || []);
      setRounds(roundRes || []);
      setAnnotators(annotatorRes || []);
      setReviewers(reviewerRes || []);
    } catch {
      message.error("Load dataset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleViewErrors = async () => {
    try {
      setErrorLoading(true);

      const res = await ErrorHistoryService.getGroupedByItem(Number(datasetId));

      setErrors(res || []);
      setErrorModal(true);
    } catch {
      message.error("Load error history failed");
    } finally {
      setErrorLoading(false);
    }
  };

  const fetchTasks = async (roundId: number) => {
    try {
      setLoading(true);
      const res = await TasksService.getTaskByRound(roundId);
      setTasks(res || []);
    } catch {
      message.error("Load tasks failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datasetId) fetchData();
  }, [datasetId]);

  /* ============================= ROUND FILTER ============================= */

  const handleRoundChange = async (roundId?: number) => {
    setSelectedRound(roundId);
    setSelectedLabel(undefined);

    if (roundId) {
      fetchTasks(roundId);

      try {
        const labels = await LabelService.getByRound(roundId);
        setRoundLabels(labels || []);
      } catch {
        message.error("Load labels failed");
        setRoundLabels([]);
      }
    } else {
      setTasks([]);
      setRoundLabels([]);
    }
  };

  /* ============================= CREATE TASK ============================= */

  const getTargetRoundId = () => {
    const sortedRounds = [...rounds].sort(
      (a, b) => a.roundNumber - b.roundNumber,
    );

    if (!selectedRound) {
      const round1 = sortedRounds.find((r) => r.roundNumber === 1);
      return round1?.roundId;
    }

    const currentRound = sortedRounds.find((r) => r.roundId === selectedRound);

    if (!currentRound) return undefined;

    const nextRound = sortedRounds.find(
      (r) => r.roundNumber === currentRound.roundNumber + 1,
    );

    return nextRound?.roundId;
  };

  const handleCreateTask = async () => {
    if (!selectedAnnotator) return message.warning("Select annotator");
    if (!selectedReviewer) return message.warning("Select reviewer");
    if (selectedRowKeys.length === 0) return message.warning("Select images");

    const targetRoundId = getTargetRoundId();

    if (!targetRoundId) return message.warning("Next round not found");

    try {
      await Promise.all(
        selectedRowKeys.map((itemId) =>
          TasksService.create({
            dataItemId: itemId,
            roundId: targetRoundId,
            annotatorId: selectedAnnotator,
            reviewerId: selectedReviewer,
          }),
        ),
      );

      message.success("Tasks created successfully");
      setSelectedRowKeys([]);

      if (selectedRound) fetchTasks(selectedRound);
    } catch (error: any) {
      message.error(
        error?.response?.data ?? "Create task failed, Task already exists",
      );
    }
  };

  /* ============================= EXPORT DATASET ============================= */

  const handleExportDataset = async () => {
    try {
      setExportLoading(true);

      let res;

      if (selectedRound) res = await ExportService.exportByRound(selectedRound);
      else res = await ExportService.exportAll(Number(datasetId));

      setExportData(res);
      setExportModal(true);
    } catch {
      message.error("Export dataset failed");
    } finally {
      setExportLoading(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    message.success("JSON copied");
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "dataset-export.json";

    link.click();
  };

  /* ============================= TABLE ============================= */

  const tableData: TableItem[] = selectedRound
    ? tasks.map((t) => ({
        key: t.taskId,
        itemId: t.dataItemId,
        fileUrl:
          dataItems.find((i) => i.itemId === t.dataItemId)?.fileUrl || "",
        annotatorName: t.annotatorName,
        reviewerName: t.reviewerName,
        status: t.status,
      }))
    : dataItems.map((i) => ({
        key: i.itemId,
        itemId: i.itemId,
        fileUrl: i.fileUrl,
        status: i.status,
      }));

  let filtered = tableData.filter((i: any) =>
    i.fileUrl?.toLowerCase().includes(search.toLowerCase()),
  );

  if (selectedLabel) {
    filtered = filtered.filter((item) =>
      tasks.some(
        (t) =>
          t.dataItemId === item.itemId &&
          t.labels?.some((l: any) => l.labelId === selectedLabel),
      ),
    );
  }
  const hasAnnotator = tableData.some((item) => item.annotatorName);
  const hasReviewer = tableData.some((item) => item.reviewerName);

  const columns: any = [
    {
      title: "File",
      dataIndex: "fileUrl",
      render: (url: string) => {
        const ext = url?.split(".").pop()?.toLowerCase();

        const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext || "");
        const isVideo = ["mp4", "mov", "avi"].includes(ext || "");
        const isAudio = ["mp3", "wav"].includes(ext || "");

        if (isImage) {
          return (
            <img
              src={url}
              style={{
                width: 90,
                height: 90,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #eee",
                transition: "0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
          );
        }

        if (isVideo) {
          return (
            <video
              src={url}
              controls
              style={{
                width: 120,
                height: 90,
                borderRadius: 8,
              }}
            />
          );
        }

        if (isAudio) {
          return (
            <audio controls style={{ width: 150 }}>
              <source src={url} />
            </audio>
          );
        }

        return <Tag>Unsupported</Tag>;
      },
    },

    ...(hasAnnotator
      ? [
          {
            title: "Annotator",
            dataIndex: "annotatorName",
            render: (name: string) => <Tag color="blue">{name}</Tag>,
          },
        ]
      : []),

    ...(hasReviewer
      ? [
          {
            title: "Reviewer",
            dataIndex: "reviewerName",
            render: (name: string) => <Tag color="purple">{name}</Tag>,
          },
        ]
      : []),

    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => {
        if (s === "Pending") return <Tag color="orange">Pending</Tag>;
        if (s === "Annotating") return <Tag color="processing">Annotating</Tag>;
        if (s === "Approved") return <Tag color="green">Approved</Tag>;
        if (s === "Rejected") return <Tag color="red">Rejected</Tag>;
        if (s === "Done") return <Tag color="green">Done</Tag>;
        return <Tag>{s}</Tag>;
      },
    },
  ];

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  const handleDeleteDataset = () => {
    Modal.confirm({
      title: "Delete Dataset?",
      content: "This action cannot be undone",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await DatasetService.delete(Number(datasetId));
          message.success("Deleted successfully");
          navigate("/projects");
        } catch {
          message.error("Delete failed");
        }
      },
    });
  };
  const handleUpdateDataset = async () => {
    if (!editingDataset?.datasetName)
      return message.warning("Dataset name is required");

    try {
      setEditLoading(true);

      // 1️⃣ Update dataset
      await DatasetService.update(Number(datasetId), editingDataset);

      // 2️⃣ Tạo Round + Label mới nếu có
      for (const round of editRounds) {
        const roundRes = await DatasetRoundService.create({
          datasetId: Number(datasetId),
          roundNumber: round.roundNumber,
          description: round.description,
          shapeType: round.shapeType,
          status: "Active",
        });

        const roundId = roundRes.roundId;

        if (round.labels.length > 0) {
          await Promise.all(
            round.labels.map((label) =>
              LabelService.create({ roundId, labelName: label.labelName }),
            ),
          );
        }
      }

      message.success("Dataset updated successfully");
      setEditModal(false);
      setEditRounds([]);
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("Update failed");
    } finally {
      setEditLoading(false);
    }
  };
  return (
    <div style={{ padding: 24 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        type="link"
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
      <Card
        style={{
          marginTop: 10,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ marginBottom: 0 }}>
              {dataset?.datasetName || `Dataset #${datasetId}`}
            </Title>
          </Col>

          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchData}>
                Refresh
              </Button>

              <Button
                type="primary"
                onClick={() => {
                  setEditingDataset({ datasetName: dataset?.datasetName });

                  setEditRounds([]);

                  const roundsData = rounds || [];
                  setMaxRoundNumber(
                    roundsData.length
                      ? Math.max(...roundsData.map((r) => r.roundNumber))
                      : 0,
                  );

                  setEditModal(true);
                }}
              >
                Edit
              </Button>

              <Button danger onClick={handleDeleteDataset}>
                Delete
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      <Card style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search image..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220 }}
            />
          </Col>

          <Col>
            <Select
              placeholder="Filter Round"
              style={{ width: 180 }}
              value={selectedRound}
              allowClear
              onChange={handleRoundChange}
              options={rounds.map((r) => ({
                label: `Round ${r.roundNumber}`,
                value: r.roundId,
              }))}
            />
          </Col>

          <Col>
            <Select
              placeholder="Filter by Label"
              style={{ width: 180 }}
              value={selectedLabel}
              allowClear
              onChange={(v) => setSelectedLabel(v)}
              options={roundLabels.map((l) => ({
                label: l.labelName,
                value: l.labelId,
              }))}
            />
          </Col>

          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => handleRoundChange(undefined)}
            >
              Clear
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Select
              placeholder="Select Annotator"
              style={{ width: 200 }}
              value={selectedAnnotator}
              onChange={(v) => setSelectedAnnotator(v)}
              options={annotators.map((u) => ({
                label: u.fullName,
                value: u.userId,
              }))}
            />
          </Col>

          <Col>
            <Select
              placeholder="Select Reviewer"
              style={{ width: 200 }}
              value={selectedReviewer}
              onChange={(v) => setSelectedReviewer(v)}
              options={reviewers.map((u) => ({
                label: u.fullName,
                value: u.userId,
              }))}
            />
          </Col>

          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateTask}
            >
              Create Task
            </Button>
          </Col>

          <Col>
            <Button
              icon={<ExportOutlined />}
              loading={exportLoading}
              onClick={handleExportDataset}
            >
              Export Dataset
            </Button>
          </Col>
          <Col>
            <Button danger icon={<BugOutlined />} onClick={handleViewErrors}>
              View Errors
            </Button>
          </Col>

          <Col>
            <Text strong>{selectedRowKeys.length} selected</Text>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <Table
          rowKey="itemId"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          bordered
          size="middle"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[]),
          }}
        />
      </Card>

      <Modal
        title="Export Dataset JSON"
        open={exportModal}
        onCancel={() => setExportModal(false)}
        width={900}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={handleCopyJson}>
            Copy JSON
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadJson}
          >
            Download JSON
          </Button>,
        ]}
      >
        <div
          style={{
            maxHeight: 500,
            overflow: "auto",
            background: "#111",
            color: "#00ff9c",
            padding: 16,
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "monospace",
          }}
        >
          <pre>{JSON.stringify(exportData, null, 2)}</pre>
        </div>
      </Modal>
      <Modal
        title="Dataset Error History"
        open={errorModal}
        onCancel={() => setErrorModal(false)}
        width={900}
        footer={null}
      >
        {errorLoading ? (
          <Spin />
        ) : (
          <div style={{ maxHeight: 500, overflow: "auto" }}>
            {errors.map((item: any) => (
              <Card
                key={item.itemId}
                size="small"
                style={{
                  marginBottom: 12,
                  borderRadius: 10,
                }}
              >
                <Row gutter={16} align="middle">
                  {/* Image */}
                  <Col>
                    <img
                      src={item.fileUrl}
                      style={{
                        width: 90,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #eee",
                      }}
                    />
                  </Col>

                  {/* Error List */}
                  <Col flex={1}>
                    {item.errors.length === 0 ? (
                      <Tag color="green">No Errors</Tag>
                    ) : (
                      <Space direction="vertical" size={6}>
                        {item.errors.map((e: any) => (
                          <div
                            key={e.errorId}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              background: "#fff1f0",
                              padding: "6px 10px",
                              borderRadius: 6,
                            }}
                          >
                            <Tag color="red">{e.errorMessage}</Tag>

                            <span
                              style={{
                                fontSize: 12,
                                color: "#888",
                              }}
                            >
                              {dayjs(e.createdAt).format("DD/MM/YYYY HH:mm")}
                            </span>
                          </div>
                        ))}
                      </Space>
                    )}
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        )}
      </Modal>
      <Modal
        title="Update Dataset"
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={handleUpdateDataset}
        confirmLoading={editLoading}
        width={800}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {/* Dataset Name */}
          <Input
            placeholder="Dataset Name"
            value={editingDataset?.datasetName}
            onChange={(e) =>
              setEditingDataset({
                ...editingDataset,
                datasetName: e.target.value,
              })
            }
          />

          <Divider>Rounds & Labels</Divider>

          <Button onClick={addEditRound}>Add Round</Button>

          {editRounds.map((round, roundIndex) => (
            <Card
              key={roundIndex}
              size="small"
              title={`Round ${round.roundNumber}`}
              extra={
                <Button danger onClick={() => removeEditRound(roundIndex)}>
                  Delete Round
                </Button>
              }
            >
              <Input
                placeholder="Round description"
                value={round.description}
                onChange={(e) =>
                  updateEditRoundDescription(roundIndex, e.target.value)
                }
                style={{ marginBottom: 8 }}
              />
              <Select
                value={round.shapeType}
                onChange={(value) => updateEditShapeType(roundIndex, value)}
                style={{ width: 200, marginBottom: 8 }}
              >
                <Select.Option value={0}>Bounding Box</Select.Option>
                <Select.Option value={1}>Classification</Select.Option>
              </Select>

              <Button onClick={() => addEditLabel(roundIndex)}>
                Add Label
              </Button>
              {round.labels.map((label, labelIndex) => (
                <Space key={labelIndex} style={{ width: "100%" }}>
                  <Input
                    placeholder="Label Name"
                    value={label.labelName}
                    onChange={(e) =>
                      updateEditLabel(roundIndex, labelIndex, e.target.value)
                    }
                  />
                  <Button
                    danger
                    onClick={() => removeEditLabel(roundIndex, labelIndex)}
                  >
                    Delete
                  </Button>
                </Space>
              ))}
            </Card>
          ))}
        </Space>
      </Modal>
    </div>
  );
};

export default DatasetDetailPage;
