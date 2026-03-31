import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  message,
  Spin,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { UserService } from "../services/user.service";

const { Content, Sider } = Layout;
const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const getRoleName = (role: number) => {
    switch (role) {
      case 1:
        return "Admin";
      case 2:
        return "Manager";
      case 3:
        return "Annotator";
      case 4:
        return "Reviewer";
      default:
        return "Unknown";
    }
  };
  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await UserService.getCurrentUser();
      setUser(data);

      form.setFieldsValue({
        fullName: data.fullName,
        email: data.email,
        role: getRoleName(data.role),
        status: data.status,
      });
    } catch (err) {
      message.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await UserService.updateProfile({
        fullName: values.fullName,
      });

      message.success("Profile updated successfully");
      fetchUser();
    } catch (err) {
      message.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px 80px" }}>
      <Title level={2}>Welcome, {user?.fullName || "Loading..."}</Title>

      <Layout style={{ background: "transparent", marginTop: 20 }}>
        {/* LEFT MENU */}
        <Sider
          width={220}
          style={{
            background: "#fff",
            borderRadius: 12,
            marginRight: 24,
          }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={["profile"]}
            items={[
              {
                key: "profile",
                icon: <UserOutlined />,
                label: "Profile",
              },
            ]}
          />
        </Sider>

        {/* RIGHT CONTENT */}
        <Content>
          <Card title="Personal Information" style={{ borderRadius: 12 }}>
            <Spin spinning={loading}>
              <Form layout="vertical" form={form} onFinish={onFinish}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Full Name"
                      name="fullName"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="Enter your full name" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Email" name="email">
                      <Input disabled />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Role" name="role">
                      <Input disabled />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Status" name="status">
                      <Input disabled />
                    </Form.Item>
                  </Col>

                </Row>
                {user?.points !== 0 && <Row>
                  <span>Points: </span> <strong>{user?.points}</strong>
                </Row>}
                <div style={{ textAlign: "right" }}>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save changes
                  </Button>
                </div>
              </Form>
            </Spin>
          </Card>
        </Content>
      </Layout>
    </div>
  );
};

export default ProfilePage;
