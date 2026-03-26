import React, { useState } from "react";
import { Button, Input, Typography, Form, message, Modal } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
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

  // ================= LOGIN =================
  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);

      const res = await AuthService.login(values);

      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      localStorage.setItem("user", res.email);

      message.success("Login success");

      if (!res.isChangePassword) {
        navigate("/change-password");
        return;
      }

      if (Number(res.role) === 1) {
        navigate("/user-manage");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.log({ error });
      message.error(error?.response?.data || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= FORGOT PASSWORD =================
  const [openForgot, setOpenForgot] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");

  const [emailForgot, setEmailForgot] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loadingForgot, setLoadingForgot] = useState(false);

  // STEP 1: SEND OTP
  const handleSendOtp = async () => {
    if (!emailForgot) {
      message.warning("Please enter your email!");
      return;
    }

    try {
      setLoadingForgot(true);

      await AuthService.forgotPassword({ email: emailForgot });

      message.success("OTP has been sent to your email!");
      setStep("otp");
    } catch (error: any) {
      message.error(error?.response?.data || "Send OTP failed");
    } finally {
      setLoadingForgot(false);
    }
  };

  // STEP 2: VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      message.warning("Please enter OTP!");
      return;
    }

    try {
      setLoadingForgot(true);

      await AuthService.verifyOtp({
        email: emailForgot,
        otp,
      });

      message.success("OTP verified!");
      setStep("reset");
    } catch (error: any) {
      message.error(error?.response?.data || "Invalid OTP");
    } finally {
      setLoadingForgot(false);
    }
  };

  // STEP 3: RESET PASSWORD
  const handleResetPassword = async () => {
    if (!newPassword) {
      message.warning("Please enter new password!");
      return;
    }

    try {
      setLoadingForgot(true);

      await AuthService.resetPassword({
        email: emailForgot,
        otp,
        newPassword,
      });

      message.success("Password reset successfully!");

      // reset state
      setOpenForgot(false);
      setStep("email");
      setEmailForgot("");
      setOtp("");
      setNewPassword("");
    } catch (error: any) {
      message.error(error?.response?.data || "Reset password failed");
    } finally {
      setLoadingForgot(false);
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
            <a
              onClick={() => setOpenForgot(true)}
              style={{ color: "blue", cursor: "pointer" }}
            >
              Forgot password?
            </a>
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
        </div>
      </div>

      {/* ================= MODAL FORGOT PASSWORD ================= */}
      <Modal
        title="Forgot Password"
        open={openForgot}
        onCancel={() => setOpenForgot(false)}
        footer={null}
      >
        {/* STEP 1 */}
        {step === "email" && (
          <>
            <Input
              placeholder="Enter your email"
              value={emailForgot}
              onChange={(e) => setEmailForgot(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <Button
              type="primary"
              block
              loading={loadingForgot}
              onClick={handleSendOtp}
            >
              Send OTP
            </Button>
          </>
        )}

        {/* STEP 2 */}
        {step === "otp" && (
          <>
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <Button
              type="primary"
              block
              loading={loadingForgot}
              onClick={handleVerifyOtp}
            >
              Verify OTP
            </Button>
          </>
        )}

        {/* STEP 3 */}
        {step === "reset" && (
          <>
            <Input.Password
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <Button
              type="primary"
              block
              loading={loadingForgot}
              onClick={handleResetPassword}
            >
              Reset Password
            </Button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default LoginPage;
