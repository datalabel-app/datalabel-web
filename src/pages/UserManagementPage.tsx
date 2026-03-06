import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Spin,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";

const { Title } = Typography;

interface User {
  userId: number;
  fullName: string;
  email: string;
  role: number;
}

const roleOptions = [
  { label: "Admin", value: 1 },
  { label: "Manager", value: 2 },
  { label: "Annotator", value: 3 },
  { label: "Reviewer", value: 4 },
];

const roleMap: any = {
  1: "Admin",
  2: "Manager",
  3: "Annotator",
  4: "Reviewer",
};

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [form] = Form.useForm();

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await UserService.getAll();

      setUsers(res || []);
    } catch {
      message.error("Load users failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      setSubmitLoading(true);

      await AuthService.register(values);

      message.success("User created");

      setModalOpen(false);
      form.resetFields();

      fetchUsers();
    } catch {
      message.error("Create user failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "userId",
      width: 80,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role: number) => roleMap[role],
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Title level={4}>User Management</Title>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Create User
          </Button>
        </Space>

        <Table
          rowKey="userId"
          columns={columns}
          dataSource={users}
          style={{ marginTop: 20 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* CREATE USER */}
      <Modal
        open={modalOpen}
        title="Create User"
        footer={null}
        onCancel={() => setModalOpen(false)}
      >
        <Form layout="vertical" form={form} onFinish={handleCreate}>
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select options={roleOptions} />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitLoading}
            block
          >
            Create User
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
