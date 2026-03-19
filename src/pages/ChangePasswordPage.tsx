import React, { useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { UserService } from "../services/user.service";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const ChangePasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      await UserService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      message.success("Change password successfully!");

      localStorage.setItem("isChangePassword", "true");

      navigate("/");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Change failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <Title level={3}>Change Password</Title>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="oldPassword"
          rules={[{ required: true, message: "Enter old password" }]}
        >
          <Input.Password placeholder="Old Password" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          rules={[
            { required: true, message: "Enter new password" },
            { min: 6, message: "At least 6 characters" },
          ]}
        >
          <Input.Password placeholder="New Password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Confirm password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("Passwords do not match");
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm Password" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading}>
          Change Password
        </Button>
      </Form>
    </div>
  );
};

export default ChangePasswordPage;
