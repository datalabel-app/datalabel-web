import React, { useState } from "react";
import { Button, Input, Typography, Form, message } from "antd";
import { GoogleOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/auth.service";

const { Title } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);

      const res = await AuthService.login(values);

      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      localStorage.setItem("user", res.email);
      message.success("Login success");
      if (Number(res.role) === 1) {
        navigate("/user-manage");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Login failed. Please try again",
      );
    } finally {
      setLoading(false);
    }
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
              name="email"
              rules={[{ required: true, message: "Please enter email!" }]}
            >
              <Input
                size="large"
                placeholder="Email"
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
              <Button
                type="primary"
                size="large"
                block
                htmlType="submit"
                loading={loading}
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>

          {/* <Button
            size="large"
            block
            className="google-btn"
            icon={<GoogleOutlined />}
          >
            Continue with Google
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
