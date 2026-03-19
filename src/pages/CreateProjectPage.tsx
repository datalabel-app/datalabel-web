import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { ProjectService } from "../services/project.service";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const CreateProjectPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        projectName: values.name,
        description: values.description || "",
      };

      const res = await ProjectService.create(payload);

      const projectId = res.projectId || res.id;

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

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 30,
              }}
            >
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit & Continue
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CreateProjectPage;
