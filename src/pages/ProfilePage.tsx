import React from "react";
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
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Content, Sider } = Layout;
const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const userEmail = localStorage.getItem("user");
  const onFinish = (values: any) => {
    console.log("Profile updated:", values);
  };

  return (
    <div style={{ padding: "40px 80px" }}>
      <Title level={2}>Welcome, {userEmail}</Title>

      <Layout style={{ background: "transparent", marginTop: 20 }}>
        {/* LEFT MENU */}
        <Sider
          width={220}
          style={{
            background: "#fff",
            borderRadius: 8,
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
              {
                key: "security",
                icon: <LockOutlined />,
                label: "Security",
              },
            ]}
          />
        </Sider>

        {/* RIGHT CONTENT */}
        <Content>
          <Card title="Personal Information">
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              initialValues={{
                firstName: "abc",
                lastName: "Khang",
                email: "khang73@gmail.com",
                username: "khang",
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <div style={{ textAlign: "right" }}>
                <Button type="primary" htmlType="submit">
                  Save changes
                </Button>
              </div>
            </Form>
          </Card>
        </Content>
      </Layout>
    </div>
  );
};

export default ProfilePage;
