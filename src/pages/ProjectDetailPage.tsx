import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Space,
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

const { Title, Text } = Typography;

interface Project {
  projectId: number;
  projectName: string;
  description: string;
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
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);

  const [projectModal, setProjectModal] = useState(false);
  const [projectForm] = Form.useForm();

  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);

      const res = await ProjectService.getById(Number(id));

      setProject(res);
      setDatasets(res.datasets || []);
    } catch {
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

  if (loading || !project) {
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* BACK BUTTON */}

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

          <Button type="primary">Actions</Button>
        </Row>

        <Text type="secondary">Project #{project.projectId}</Text>

        <Row justify="space-between" style={{ marginTop: 16 }}>
          <Col span={16}>
            <Text strong>Project description</Text>

            <div style={{ marginTop: 8 }}>{project.description}</div>
          </Col>
        </Row>
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
            <Button>Sort</Button>
            <Button>Filter</Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/projects/${id}/dataset/create`)}
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
              <Col span={8} key={dataset.datasetId}>
                <Card
                  hoverable
                  onClick={() => navigate(`/datasets/${dataset.datasetId}`)}
                >
                  <Title level={5}>{dataset.datasetName}</Title>

                  <Text type="secondary">Dataset #{dataset.datasetId}</Text>

                  <div style={{ marginTop: 12 }}>
                    <Text>Status: {dataset.status}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* EDIT PROJECT MODAL */}

      <Modal
        title="Edit Project"
        open={projectModal}
        onCancel={() => setProjectModal(false)}
        footer={null}
      >
        <Form
          form={projectForm}
          layout="vertical"
          onFinish={handleUpdateProject}
        >
          <Form.Item
            label="Project name"
            name="projectName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={4} />
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
    </div>
  );
};

export default ProjectDetailPage;
