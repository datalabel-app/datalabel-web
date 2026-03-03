import React from "react";
import { Button, Input, Typography, Form } from "antd";
import { GoogleOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const onFinish = (values: LoginFormValues) => {
    console.log("Form values:", values);
    localStorage.setItem("token", "fake-jwt-token");

    navigate("/home");
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1 className="main-title">Open Data Annotation Platform</h1>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <a href="#">Forgot password?</a>
          </div>

          <Title level={3}>Sign in</Title>

          <Form<LoginFormValues> layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Please enter username!" }]}
            >
              <Input
                size="large"
                placeholder="Email or username"
                prefix={<UserOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter password!" }]}
            >
              <Input.Password
                size="large"
                placeholder="Password"
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" size="large" block htmlType="submit">
                Sign in
              </Button>
            </Form.Item>
          </Form>

          <Button
            size="large"
            block
            className="google-btn"
            icon={<GoogleOutlined />}
          >
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
