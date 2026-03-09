import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Space,
  Tabs,
  Tag,
  Select,
  Row,
  Col,
  Input,
  Empty,
  Spin,
  message,
  Modal,
  Form,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { ProjectService } from "../services/project.service";
import { LabelService } from "../services/label.service";
import { DatasetService } from "../services/dataset.service";

const { Title, Text } = Typography;

interface Project {
  projectId: number;
  projectName: string;
  description: string;
}

interface Label {
  labelId: number;
  labelName: string;
  labelType: string;
  description?: string;
}

interface Dataset {
  datasetId: number;
  datasetName: string;
  status: string;
}

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  const [loading, setLoading] = useState(false);

  const [projectModal, setProjectModal] = useState(false);
  const [labelModal, setLabelModal] = useState(false);

  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  const [projectForm] = Form.useForm();
  const [labelForm] = Form.useForm();

  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);

      const projectRes = await ProjectService.getById(id);
      setProject(projectRes);

      const labelRes = await LabelService.getByProjectId(id);
      setLabels(labelRes || []);

      const datasetRes = await DatasetService.getDatasetByProject(id);
      setDatasets(datasetRes || []);
    } catch (error) {
      message.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const handleUpdateProject = async (values: any) => {
    try {
      setSubmitLoading(true);

      await ProjectService.update(project!.projectId, values);

      message.success("Project updated");

      setProjectModal(false);

      fetchProject();
    } catch {
      message.error("Update project failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  const openAddLabel = () => {
    setEditingLabel(null);
    labelForm.resetFields();
    setLabelModal(true);
  };

  const openEditLabel = (label: Label) => {
    setEditingLabel(label);

    labelForm.setFieldsValue(label);

    setLabelModal(true);
  };

  const handleSaveLabel = async (values: any) => {
    try {
      setSubmitLoading(true);

      if (editingLabel) {
        await LabelService.update(editingLabel.labelId, values);
        message.success("Label updated");
      } else {
        await LabelService.create({
          ...values,
          projectId: id,
        });
        message.success("Label created");
      }

      setLabelModal(false);

      fetchProject();
    } catch {
      message.error("Save label failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading || !project) {
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/projects")}
        style={{ padding: 0 }}
      >
        Back to projects
      </Button>

      {/* PROJECT INFO */}

      <Card style={{ marginTop: 16 }}>
        <Row justify="space-between" align="middle">
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              {project.projectName}
            </Title>

            <EditOutlined
              style={{ cursor: "pointer" }}
              onClick={() => {
                projectForm.setFieldsValue(project);
                setProjectModal(true);
              }}
            />
          </Space>

          <Button>Actions</Button>
        </Row>

        <Text type="secondary">Project #{project.projectId}</Text>

        <Row justify="space-between" style={{ marginTop: 16 }}>
          <Col>
            <Text strong>Project description</Text>

            <div style={{ marginTop: 8 }}>{project.description}</div>
          </Col>

          <Col>
            <Space>
              <Text>Assigned to</Text>

              <Select
                placeholder="Select user"
                style={{ width: 200 }}
                options={[
                  { label: "hai43", value: "hai43" },
                  { label: "admin", value: "admin" },
                ]}
              />
            </Space>
          </Col>
        </Row>

        {/* LABELS */}

        <div style={{ marginTop: 24 }}>
          <Tabs
            defaultActiveKey="raw"
            items={[
              {
                key: "raw",
                label: "Raw",
                children: (
                  <>
                    <Space wrap style={{ marginBottom: 16 }}>
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={openAddLabel}
                      >
                        Add label
                      </Button>

                      {labels.map((label) => (
                        <Tag
                          key={label.labelId}
                          color="green"
                          style={{ cursor: "pointer" }}
                          onClick={() => openEditLabel(label)}
                        >
                          {label.labelName} <EditOutlined />
                        </Tag>
                      ))}
                    </Space>
                  </>
                ),
              },
              {
                key: "constructor",
                label: "Constructor",
                children: <div>Constructor config here...</div>,
              },
            ]}
          />
        </div>
      </Card>

      {/* DATASET TOOLBAR */}

      <div style={{ marginTop: 24 }}>
        <Row justify="space-between">
          <Space>
            <Input
              placeholder="Search dataset..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
            />

            <Button type="link">Select all</Button>
          </Space>

          <Space>
            <Button>Sort by</Button>
            <Button>Quick filters</Button>
            <Button>Filter</Button>
            <Button type="link">Clear filters</Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/projects/${id}/dataset`)}
            >
              Add Dataset
            </Button>
          </Space>
        </Row>
      </div>

      {/* DATASET LIST */}

      <div style={{ marginTop: 24 }}>
        {datasets.length === 0 ? (
          <Empty description="No datasets yet" />
        ) : (
          <Row gutter={[16, 16]}>
            {datasets.map((dataset) => (
              <Col
                span={8}
                key={dataset.datasetId}
                onClick={() => navigate(`/datasets/${dataset.datasetId}`)}
              >
                <Card
                  hoverable
                  onClick={() => navigate(`/datasets/${dataset.datasetId}`)}
                >
                  <Space direction="vertical">
                    <Title level={5} style={{ margin: 0 }}>
                      {dataset.datasetName}
                    </Title>

                    <Text type="secondary">Dataset #{dataset.datasetId}</Text>

                    <Tag color="blue">{dataset.status}</Tag>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* UPDATE PROJECT */}

      <Modal
        open={projectModal}
        title="Update Project"
        onCancel={() => setProjectModal(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={projectForm}
          onFinish={handleUpdateProject}
        >
          <Form.Item
            label="Project Name"
            name="projectName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitLoading}
            block
          >
            Update
          </Button>
        </Form>
      </Modal>

      {/* LABEL MODAL */}

      <Modal
        open={labelModal}
        title={editingLabel ? "Update Label" : "Create Label"}
        onCancel={() => setLabelModal(false)}
        footer={null}
      >
        <Form layout="vertical" form={labelForm} onFinish={handleSaveLabel}>
          <Form.Item
            label="Label Name"
            name="labelName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Label Type"
            name="labelType"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Bounding Box", value: "bbox" },
                { label: "Polygon", value: "polygon" },
                { label: "Classification", value: "classification" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitLoading}
            block
          >
            Save Label
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;