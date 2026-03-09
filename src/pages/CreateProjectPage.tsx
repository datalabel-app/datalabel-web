import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Tabs,
  Space,
  Collapse,
  Select,
  Typography,
  Row,
  Col,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { ProjectService } from "../services/project.service";
import { LabelService } from "../services/label.service";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Panel } = Collapse;

interface LabelItem {
  labelName: string;
  labelType: string;
  description: string;
}

const CreateProjectPage: React.FC = () => {
  const [form] = Form.useForm();
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const addLabel = () => {
    setLabels([
      ...labels,
      {
        labelName: "",
        labelType: "box",
        description: "",
      },
    ]);
  };

  const updateLabel = (index: number, key: keyof LabelItem, value: string) => {
    const newLabels = [...labels];
    newLabels[index][key] = value;
    setLabels(newLabels);
  };

  const removeLabel = (index: number) => {
    const newLabels = [...labels];
    newLabels.splice(index, 1);
    setLabels(newLabels);
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const projectPayload = {
        projectName: values.name,
        description: values.description || "",
      };

      const projectRes = await ProjectService.create(projectPayload);

      const projectId = projectRes.projectId || projectRes.id;

      if (labels.length > 0) {
        await Promise.all(
          labels.map((label) =>
            LabelService.create({
              projectId: projectId,
              labelName: label.labelName,
              labelType: label.labelType,
              description: label.description,
            }),
          ),
        );
      }

      message.success("Project created successfully");

      navigate(`/projects/${projectId}/dataset`);
    } catch (error) {
      message.error("Create project failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px 0",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: 800 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 30 }}>
          Create a new project
        </Title>

        <Card loading={loading}>
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Project Name"
              name="name"
              rules={[{ required: true, message: "Please enter project name" }]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea placeholder="Project description" rows={3} />
            </Form.Item>

            <Form.Item label="Labels">
              <Tabs
                defaultActiveKey="raw"
                items={[
                  {
                    key: "raw",
                    label: "Raw",
                    children: (
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Button
                          icon={<PlusOutlined />}
                          onClick={addLabel}
                          type="dashed"
                        >
                          Add label
                        </Button>

                        {labels.map((label, index) => (
                          <Card
                            key={index}
                            size="small"
                            style={{ marginTop: 10 }}
                          >
                            <Row gutter={12}>
                              <Col span={8}>
                                <Input
                                  placeholder="Label name"
                                  value={label.labelName}
                                  onChange={(e) =>
                                    updateLabel(
                                      index,
                                      "labelName",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Col>

                              <Col span={6}>
                                <Select
                                  style={{ width: "100%" }}
                                  value={label.labelType}
                                  options={[
                                    { label: "Box", value: "box" },
                                    { label: "Polygon", value: "polygon" },
                                    { label: "Point", value: "point" },
                                  ]}
                                  onChange={(value) =>
                                    updateLabel(index, "labelType", value)
                                  }
                                />
                              </Col>

                              <Col span={8}>
                                <Input
                                  placeholder="Description"
                                  value={label.description}
                                  onChange={(e) =>
                                    updateLabel(
                                      index,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Col>

                              <Col span={2}>
                                <Button
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => removeLabel(index)}
                                />
                              </Col>
                            </Row>
                          </Card>
                        ))}
                      </Space>
                    ),
                  },
                  {
                    key: "constructor",
                    label: "Constructor",
                    children: (
                      <div style={{ padding: 10 }}>
                        Constructor config here...
                      </div>
                    ),
                  },
                ]}
              />
            </Form.Item>

            <Collapse>
              <Panel header="Advanced configuration" key="1">
                <Form.Item label="Issue tracker" name="issueTracker">
                  <Input placeholder="Attach issue tracker URL" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Source storage"
                      name="sourceStorage"
                      initialValue="local"
                    >
                      <Select
                        options={[
                          { label: "Local", value: "local" },
                          { label: "Cloud", value: "cloud" },
                        ]}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Target storage"
                      name="targetStorage"
                      initialValue="local"
                    >
                      <Select
                        options={[
                          { label: "Local", value: "local" },
                          { label: "Cloud", value: "cloud" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
            </Collapse>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 30,
              }}
            >
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Submit & Continue
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CreateProjectPage;
