import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Spin, message } from "antd";
import {
  UserOutlined,
  ProjectOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { DashboardService } from "../services/dashboard.service";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const { Title, Text } = Typography;

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await DashboardService.getAdmin();
      setData(res);
    } catch {
      message.error("Cannot load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  // ===== DATA =====
  const taskData = [
    { name: "Pending", value: data.tasks.pending },
    { name: "Completed", value: data.tasks.completed },
  ];

  const labelData = [
    { name: "Pending", value: data.labels.pending },
    { name: "Approved", value: data.labels.approved },
    { name: "Rejected", value: data.labels.rejected },
  ];

  const COLORS = ["#faad14", "#52c41a", "#ff4d4f"];

  return (
    <div style={{ padding: 30 }}>
      <Title level={2}>Admin Dashboard</Title>

      {/* OVERVIEW */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card style={{ borderRadius: 12, borderLeft: "5px solid #1890ff" }}>
            <UserOutlined style={{ fontSize: 24 }} />
            <Title level={3}>{data.totalUsers}</Title>
            <Text>Total Users</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={{ borderRadius: 12, borderLeft: "5px solid #13c2c2" }}>
            <ProjectOutlined style={{ fontSize: 24 }} />
            <Title level={3}>{data.totalProjects}</Title>
            <Text>Total Projects</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={{ borderRadius: 12, borderLeft: "5px solid #722ed1" }}>
            <DatabaseOutlined style={{ fontSize: 24 }} />
            <Title level={3}>{data.totalDatasets}</Title>
            <Text>Total Datasets</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={{ borderRadius: 12, borderLeft: "5px solid #52c41a" }}>
            <CheckCircleOutlined style={{ fontSize: 24 }} />
            <Title level={3}>{data.totalTasks}</Title>
            <Text>Total Tasks</Text>
          </Card>
        </Col>
      </Row>

      {/* CHART */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        {/* TASK CHART */}
        <Col span={12}>
          <Card title="Task Overview" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* LABEL CHART */}
        <Col span={12}>
          <Card title="Label Distribution" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={labelData} dataKey="value" outerRadius={80} label>
                  {labelData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
