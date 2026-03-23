import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  Divider,
  Select,
  Row,
  Col,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";

import DatasetUploader from "../components/DatasetUploader";

import { DatasetService } from "../services/dataset.service";
import { DatasetRoundService } from "../services/datasetround.service";
import { LabelService } from "../services/label.service";
import { UploadService } from "../services/upload.service";
import { DataItemService } from "../services/dataitem.service";
import { UserService } from "../services/user.service";
import { TasksService } from "../services/task.service";

const { Title, Text } = Typography;
const { Option } = Select;

interface UploadedImage {
  url: string;
  publicId: string;
}

const CreateDatasetPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [uploadType, setUploadType] = useState<"image" | "zip">("image");
  const [files, setFiles] = useState<File[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [annotators, setAnnotators] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const a = await UserService.getAnnotator();
      const r = await UserService.getReviewer();
      setAnnotators(a);
      setReviewers(r);
    };
    fetchUsers();
  }, []);

  const addLabel = () => setLabels([...labels, ""]);
  const updateLabel = (index: number, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
  };
  const removeLabel = (index: number) => {
    const newLabels = [...labels];
    newLabels.splice(index, 1);
    setLabels(newLabels);
  };

  const onFinish = async (values: any) => {
    try {
      if (files.length === 0) {
        message.warning("Please upload file");
        return;
      }

      setLoading(true);

      // 1. DATASET
      const datasetRes = await DatasetService.create({
        projectId: Number(id),
        datasetName: values.datasetName,
        status: "Active",
      });

      const datasetId = datasetRes.datasetId;

      // 2. ROUND
      const roundRes = await DatasetRoundService.create({
        datasetId,
        roundNumber: 1,
        description: values.description,
        shapeType: values.shapeType,
        status: "Active",
      });

      const roundId = roundRes.roundId;

      // 3. LABEL
      await Promise.all(
        labels.map((label) =>
          LabelService.create({ roundId, labelName: label }),
        ),
      );

      // 4. UPLOAD
      let images: UploadedImage[] = [];

      if (uploadType === "image") {
        const uploadRes = await UploadService.uploadImages(files);
        images = uploadRes.urls || uploadRes;
      } else {
        const uploadRes = await UploadService.uploadZip(files[0]);
        images = uploadRes.map((item: any) => ({
          url: item.url,
          publicId: item.publicId,
        }));
      }

      // 5. DATA ITEM
      const createdItems = await Promise.all(
        images.map((img) =>
          DataItemService.create({
            datasetId,
            fileUrl: img.url,
            status: 0,
          }),
        ),
      );

      const dataItemIds = createdItems.map((i: any) => i.itemId);

      // 6. TASK
      await TasksService.create({
        roundId,
        annotatorId: values.annotatorId || null,
        reviewerId: values.reviewerId || null,
        dataItemIds,
      });

      message.success("Created successfully 🚀");
      navigate(`/projects/${id}`);
    } catch (err) {
      console.error(err);
      message.error("Create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
      <Card style={{ width: 900, borderRadius: 12 }}>
        <Title level={3}>Create Dataset & Task</Title>

        <Form layout="vertical" onFinish={onFinish}>
          {/* DATASET */}
          <Divider orientation="horizontal" titlePlacement="left">Dataset Info</Divider>

          <Form.Item
            label="Dataset Name"
            name="datasetName"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập tên dataset..." />
          </Form.Item>

          {/* ROUND */}
          <Divider orientation="horizontal" titlePlacement="left">Round Config</Divider>

          <Form.Item
            label="Instruction (Mô tả công việc)"
            name="description"
            rules={[{ required: true }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Vẽ bounding box quanh tất cả người"
            />
          </Form.Item>

          <Form.Item label="Shape Type" name="shapeType" initialValue={0}>
            <Select>
              <Option value={0}>Bounding Box</Option>
              <Option value={1}>Classification</Option>
            </Select>
          </Form.Item>

          {/* LABEL */}
          <Divider orientation="horizontal" titlePlacement="left">Labels</Divider>

          <Button onClick={addLabel}>+ Add Label</Button>

          <div style={{ marginTop: 10 }}>
            {labels.map((label, index) => (
              <Space key={index} style={{ marginBottom: 8 }}>
                <Input
                  placeholder="Label name"
                  value={label}
                  onChange={(e) => updateLabel(index, e.target.value)}
                />
                <Button danger onClick={() => removeLabel(index)}>
                  X
                </Button>
              </Space>
            ))}
          </div>

          {/* ASSIGN */}
          <Divider orientation="horizontal" titlePlacement="left">Assign Task</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Annotator" name="annotatorId">
                <Select allowClear placeholder="Chọn người annotate">
                  {annotators.map((u) => (
                    <Option key={u.userId} value={u.userId}>
                      {u.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Reviewer" name="reviewerId">
                <Select allowClear placeholder="Chọn người review">
                  {reviewers.map((u) => (
                    <Option key={u.userId} value={u.userId}>
                      {u.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* UPLOAD */}
          <Divider orientation="horizontal" titlePlacement="left">Upload Data</Divider>

          <Form.Item>
            <Select value={uploadType} onChange={(v) => setUploadType(v)}>
              <Option value="image">Images</Option>
              <Option value="zip">ZIP</Option>
            </Select>
          </Form.Item>

          {uploadType === "image" ? (
            <DatasetUploader files={files} setFiles={setFiles} />
          ) : (
            <input
              type="file"
              accept=".zip"
              onChange={(e) => {
                if (e.target.files?.[0]) setFiles([e.target.files[0]]);
              }}
            />
          )}

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Create Dataset + Task
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CreateDatasetPage;
