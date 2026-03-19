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
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { ProjectService } from "../services/project.service";
import "../styles/project-detail.css";
import { LabelService } from "../services/label.service";

const { Title, Text } = Typography;

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pendingLabels, setPendingLabels] = useState<any[]>([]);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [projectModal, setProjectModal] = useState(false);
  const [projectForm] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  // ================= FETCH =================
  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await ProjectService.getById(Number(id)!);
      setProject(res);
      setDatasets(res.datasets || []);
    } catch {
      message.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };
  const fetchPendingLabels = async () => {
    try {
      setLoadingLabels(true);
      const res = await LabelService.getPendingByProject(Number(id));
      setPendingLabels(res);
    } catch {
      message.error("Failed to load pending labels");
    } finally {
      setLoadingLabels(false);
    }
  };
  useEffect(() => {
    if (id) {
      fetchProject();
      fetchPendingLabels();
    }
  }, [id]);

  // ================= UPDATE =================
  const handleUpdateProject = async (values: any) => {
    try {
      setSubmitLoading(true);
      await ProjectService.update(project.projectId, values);
      message.success("Project updated");
      setProjectModal(false);
      fetchProject();
    } catch {
      message.error("Update failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDeleteProject = () => {
    Modal.confirm({
      title: "Delete Project",
      content: "Are you sure?",
      okType: "danger",
      onOk: async () => {
        try {
          await ProjectService.delete(project.projectId);
          message.success("Deleted!");
          navigate("/projects");
        } catch {
          message.error("Delete failed");
        }
      },
    });
  };

  const handleApprove = async (labelId: number) => {
    try {
      await LabelService.approve(labelId);
      message.success("Approved!");
      fetchPendingLabels();
    } catch {
      message.error("Approve failed");
    }
  };

  const handleReject = async (labelId: number) => {
    try {
      await LabelService.reject(labelId);
      message.success("Rejected!");
      fetchPendingLabels();
    } catch {
      message.error("Reject failed");
    }
  };

  if (loading || !project) {
    return (
      <div className="center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      {/* BACK */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/projects")}
      >
        Back
      </Button>

      {/* PROJECT CARD */}
      <Card className="project-card">
        <Row justify="space-between" align="middle">
          <Space className="project-title">
            <Title level={4}>{project.projectName}</Title>

            <EditOutlined
              className="icon-action"
              onClick={() => {
                projectForm.setFieldsValue(project);
                setProjectModal(true);
              }}
            />
          </Space>

          <Space>
            <Button danger onClick={handleDeleteProject}>
              Delete
            </Button>
          </Space>
        </Row>

        {/* <Text type="secondary">Project #{project.projectId}</Text> */}

        <div style={{ marginTop: 16 }}>
          <Text strong>Description</Text>
          <div className="desc">{project.description}</div>
        </div>
      </Card>

      {/* TOOLBAR */}
      <div className="toolbar">
        <Row justify="space-between">
          <Space>
            <Input
              placeholder="Search dataset..."
              prefix={<SearchOutlined />}
            />
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/projects/${id}/dataset`)}
          >
            Add Dataset
          </Button>
        </Row>
      </div>

      {/* DATASETS */}
      <div style={{ marginTop: 20 }}>
        {datasets.length === 0 ? (
          <Empty />
        ) : (
          <Row gutter={[16, 16]}>
            {datasets.map((item) => (
              <Col span={8} key={item.datasetId}>
                <Card
                  className="dataset-card"
                  hoverable
                  onClick={() => navigate(`/datasets/${item.datasetId}`)}
                >
                  <Title level={5}>{item.datasetName}</Title>
                  {/* 
                  <Text type="secondary">#{item.datasetId}</Text> */}

                  <div style={{ marginTop: 10 }}>
                    <Tag color={item.status === "Active" ? "green" : "orange"}>
                      {item.status}
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* PENDING LABELS */}
      <div style={{ marginTop: 40 }}>
        <Title level={4}>Pending Label Requests</Title>

        {loadingLabels ? (
          <Spin />
        ) : pendingLabels.length === 0 ? (
          <Empty description="No pending labels" />
        ) : (
          <Row gutter={[16, 16]}>
            {pendingLabels.map((item) => (
              <Col span={8} key={item.labelId}>
                <Card
                  style={{
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {/* LABEL NAME */}
                    <Title level={5}>{item.labelName}</Title>

                    {/* INFO */}
                    <Text type="secondary">
                      Dataset: {item.dataset.datasetName}
                    </Text>

                    <Text type="secondary">
                      Round {item.round.roundNumber}: {item.round.description}
                    </Text>
                    <Text type="secondary">
                      Annotator request: {item?.annotator?.email}
                    </Text>

                    {/* STATUS */}
                    <Tag color="gold">Pending</Tag>

                    {/* ACTION */}
                    <Space style={{ marginTop: 10 }}>
                      <Button
                        type="primary"
                        onClick={() => handleApprove(item.labelId)}
                      >
                        Approve
                      </Button>

                      <Button danger onClick={() => handleReject(item.labelId)}>
                        Reject
                      </Button>
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* MODAL EDIT */}
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
            label="Project Name"
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
