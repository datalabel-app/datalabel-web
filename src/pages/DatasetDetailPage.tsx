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
} from "antd";

import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import { DataItemService } from "../services/dataitem.service";
import { DatasetService } from "../services/dataset.service";
import { TasksService } from "../services/task.service";
import { UserService } from "../services/user.service";
import { LabelService } from "../services/label.service";
import { DatasetRoundService } from "../services/datasetround.service";

const { Title } = Typography;

const DatasetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { datasetId } = useParams();

  const [dataItems, setDataItems] = useState<any[]>([]);
  const [dataset, setDataset] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [annotators, setAnnotators] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);

  const [selectedAnnotator, setSelectedAnnotator] = useState<number>();
  const [selectedReviewer, setSelectedReviewer] = useState<number>();

  const [description, setDescription] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [shapeType, setShapeType] = useState<number>(0);
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const datasetRes = await DatasetService.getById(Number(datasetId));
      const items = await DataItemService.getByDataset(Number(datasetId));

      setDataset(datasetRes);
      setDataItems(items || []);
    } catch {
      message.error("Load dataset failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datasetId) fetchData();
  }, [datasetId]);

  const handleCreateTask = async () => {
    if (dataItems.length === 0) {
      message.warning("Dataset không có item");
      return;
    }

    try {
      const [annoRes, reviRes] = await Promise.all([
        UserService.getAnnotator(),
        UserService.getReviewer(),
      ]);

      setAnnotators(annoRes || []);
      setReviewers(reviRes || []);

      setCreateModal(true);
    } catch {
      message.error("Load users failed");
    }
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    setLabels([...labels, newLabel]);
    setNewLabel("");
  };

  const handleSubmitCreateTask = async () => {
    if (!selectedAnnotator || !selectedReviewer) {
      message.warning("Chọn annotator & reviewer");
      return;
    }

    try {
      setCreating(true);

      const allItemIds = dataItems.map((i) => i.itemId);

      const roundRes = await DatasetRoundService.create({
        datasetId: Number(datasetId),
        description: description,
        roundNumber: 1,
        shapeType: shapeType,
      });

      const roundId = roundRes.roundId;

      for (const label of labels) {
        await LabelService.create({
          roundId: roundId,
          labelName: label,
        });
      }

      await TasksService.create({
        roundId: roundId,
        annotatorId: selectedAnnotator,
        reviewerId: selectedReviewer,
        dataItemIds: allItemIds,
      });

      message.success(`Tạo task cho ${allItemIds.length} items`);

      // reset
      setCreateModal(false);
      setLabels([]);
    } catch {
      message.error("Tạo task thất bại");
    } finally {
      setCreating(false);
    }
  };

  // ================= TABLE =================

  const columns: any = [
    {
      title: "File",
      dataIndex: "fileUrl",
      render: (url: string) => (
        <img src={url} style={{ width: 90, height: 90, objectFit: "cover" }} />
      ),
    },
  ];

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
        Back
      </Button>

      <Card style={{ marginTop: 10 }}>
        <Row justify="space-between">
          <Title level={4}>{dataset?.datasetName}</Title>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateTask}
          >
            Create Task
          </Button>
        </Row>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <Table rowKey="itemId" columns={columns} dataSource={dataItems} />
      </Card>

      <Modal
        title="Create Task"
        open={createModal}
        onCancel={() => setCreateModal(false)}
        onOk={handleSubmitCreateTask}
        confirmLoading={creating}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <div>Round Description</div>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <div>Round Type</div>
            <Select
              style={{ width: "100%" }}
              value={shapeType}
              onChange={(value) => setShapeType(value)}
            >
              <Select.Option value={0}>Bounding Box</Select.Option>
              <Select.Option value={1}>Classification</Select.Option>
            </Select>
          </div>

          <div>
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
                <Tag key={i}>{l}</Tag>
              ))}
            </div>
          </div>

          <div>
            <div>Annotator</div>
            <Select
              style={{ width: "100%" }}
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
              style={{ width: "100%" }}
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
            <b>{dataItems.length}</b> items sẽ được tạo task
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default DatasetDetailPage;
