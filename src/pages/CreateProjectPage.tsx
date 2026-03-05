import React from "react";
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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Panel } = Collapse;

const CreateProjectPage: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Project Data:", values);
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

        <Card>
          <Form layout="vertical" form={form} onFinish={onFinish}>
            {/* NAME */}
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter project name" }]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>

            {/* LABELS */}
            <Form.Item label="Labels">
              <Tabs
                defaultActiveKey="raw"
                items={[
                  {
                    key: "raw",
                    label: "Raw",
                    children: (
                      <Space>
                        <Button icon={<PlusOutlined />}>Add label</Button>
                        <Button icon={<PlusOutlined />}>Setup skeleton</Button>
                        <Button icon={<PlusOutlined />}>From model</Button>
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

            {/* ADVANCED CONFIG */}
            <Collapse defaultActiveKey={[]}>
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

            {/* BUTTONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 30,
              }}
            >
              <Space>
                <Button type="primary" htmlType="submit">
                  Submit & Open
                </Button>
                <Button type="primary" htmlType="submit">
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
