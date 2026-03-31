import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Input,
  Empty,
  Spin,
  message,
  Modal,
  Form,
  Tag,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import { ProjectService } from "../services/project.service";
import { DatasetService } from "../services/dataset.service";
import { LabelService } from "../services/label.service";

import "../styles/project-detail.css";

const { Title, Text } = Typography;

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState<any>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [pendingLabels, setPendingLabels] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [search, setSearch] = useState("");

  const [projectModal, setProjectModal] = useState(false);
  const [projectForm] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedKeys((prev) =>
      prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id],
    );
  };
  // ================= FETCH =================
  const fetchProject = async () => {
    try {
      const res = await ProjectService.getById(Number(id));
      setProject(res);
    } catch {
      message.error("Failed to load project");
    }
  };

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const res = await DatasetService.getTreeDatasetByProject(Number(id));
      setDatasets(res);
    } catch {
      message.error("Failed to load datasets");
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
      fetchDatasets();
      fetchPendingLabels();
    }
  }, [id]);

  // ================= UPDATE =================
  const handleUpdateProject = async (values: any) => {
    try {
      setSubmitLoading(true);
      await ProjectService.update(project.projectId, values);
      message.success("Updated!");
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

  // ================= LABEL =================
  const handleApprove = async (id: number) => {
    await LabelService.approve(id);
    message.success("Approved");
    fetchPendingLabels();
    fetchProject();
  };

  const handleReject = async (id: number) => {
    await LabelService.reject(id);
    message.success("Rejected");
    fetchPendingLabels();
  };

  const filterTree = (data: any[]): any[] => {
    return data
      .map((item) => {
        const children = filterTree(item.children || []);

        if (
          item.datasetName.toLowerCase().includes(search.toLowerCase()) ||
          children.length > 0
        ) {
          return { ...item, children };
        }

        return null;
      })
      .filter(Boolean);
  };

  const filteredDatasets = search ? filterTree(datasets) : datasets;
  const getShapeTypeTag = (shapeType: number | null) => {
    if (shapeType === 0) {
      return <Tag color="blue">BBox</Tag>;
    }
    if (shapeType === 1) {
      return <Tag color="purple">Classification</Tag>;
    }
    return null;
  };
  const renderTree = (
    data: any[],
    level = 0,
    parentShapeType: number | null = null,
  ) => {
    return data.map((item) => {
      const isExpanded = expandedKeys.includes(item.datasetId);
      const hasChildren = item.children && item.children.length > 0;
      const inheritedShapeType =
        item.shapeType !== null && item.shapeType !== undefined
          ? item.shapeType
          : parentShapeType;

      return (
        <div key={item.datasetId} style={{ marginLeft: level * 16 }}>
          <Card
            hoverable
            style={{
              marginBottom: 8,
              borderLeft: `4px solid ${
                level === 0 ? "#1677ff" : level === 1 ? "#52c41a" : "#faad14"
              }`,
              borderRadius: 8,
            }}
            onClick={() => navigate(`/datasets/${item.datasetId}`)}
          >
            <Row justify="space-between" align="middle">
              <Space align="center">
                {hasChildren && (
                  <RightOutlined
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(item.datasetId);
                    }}
                    style={{
                      fontSize: 20,
                      color: "#666",
                      cursor: "pointer",
                      transition: "transform 0.25s ease",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  />
                )}

                <div style={{ cursor: "pointer" }}>
                  <Title level={5} style={{ margin: 0 }}>
                    📁 {item.datasetName}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {level === 0 ? "Root" : `Level ${level}`}
                  </Text>
                </div>
              </Space>

              <Space>
                {/* 👇 CHỈ HIỂN THỊ từ CHA */}
                {getShapeTypeTag(parentShapeType)}

                <Tag color={item.status === "Active" ? "green" : "orange"}>
                  {item.status}
                </Tag>
              </Space>
            </Row>
          </Card>

          {/* 👇 truyền xuống */}
          {hasChildren &&
            isExpanded &&
            renderTree(item.children, level + 1, inheritedShapeType)}
        </div>
      );
    });
  };

  if (!project) return <Spin />;

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

      {/* PROJECT */}
      <Card style={{ marginBottom: 20 }}>
        <Row justify="space-between">
          <Space>
            <Title level={4}>{project.projectName}</Title>
            <EditOutlined
              onClick={() => {
                projectForm.setFieldsValue(project);
                setProjectModal(true);
              }}
            />
          </Space>

          <Button danger onClick={handleDeleteProject}>
            Delete
          </Button>
        </Row>

        <Text>{project.description}</Text>
      </Card>

      {/* TOOLBAR */}
      <Row justify="space-between" style={{ marginBottom: 20 }}>
        <Input
          placeholder="Search dataset..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(`/projects/${id}/dataset`)}
        >
          Add Dataset
        </Button>
      </Row>

      {/* TREE */}
      {loading ? (
        <Spin />
      ) : filteredDatasets.length === 0 ? (
        <Empty />
      ) : (
        renderTree(filteredDatasets)
      )}

      {/* LABEL REQUEST */}
      <div style={{ marginTop: 40 }}>
        <Title level={4}>Pending Labels</Title>

        {loadingLabels ? (
          <Spin />
        ) : pendingLabels.length === 0 ? (
          <Empty />
        ) : (
          <Row gutter={[16, 16]}>
            {pendingLabels.map((item) => (
              <Col span={8} key={item.labelId}>
                <Card>
                  <Space direction="vertical">
                    <Title level={5}>{item.labelName}</Title>

                    <Text type="secondary">
                      Dataset: {item.dataset?.datasetName}
                    </Text>

                    <Text type="secondary">
                      Round {item.round?.description}
                    </Text>
                    <Text type="secondary">
                      Annotator {item.annotator?.fullName}
                    </Text>

                    <Tag color="gold">Pending</Tag>

                    <Space>
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

      {/* MODAL */}
      <Modal
        open={projectModal}
        title="Edit Project"
        onCancel={() => setProjectModal(false)}
        footer={null}
      >
        <Form form={projectForm} onFinish={handleUpdateProject}>
          <Form.Item name="projectName" rules={[{ required: true }]}>
            <Input placeholder="Project Name" />
          </Form.Item>

          <Form.Item name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Button htmlType="submit" type="primary" loading={submitLoading}>
            Update
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
