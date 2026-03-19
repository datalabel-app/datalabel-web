import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Spin, message, Card } from "antd";
import {
  ProjectOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { DashboardService } from "../services/dashboard.service";
import "../styles/dashboard.css";

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

const { Title } = Typography;

const ManagerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await DashboardService.getManager();
      setData(res);
    } catch {
      message.error("Cannot load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  // DATA
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
    <div className="dashboard-container">
      <Title level={2}>Manager Dashboard</Title>

      {/* ===== TOP CARDS ===== */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <div className="dashboard-card gradient-1">
            <ProjectOutlined className="card-icon" />
            <h3>{data.totalProjects}</h3>
            <span>Total Projects</span>
          </div>
        </Col>

        <Col span={6}>
          <div className="dashboard-card gradient-2">
            <DatabaseOutlined className="card-icon" />
            <h3>{data.totalDatasets}</h3>
            <span>Total Datasets</span>
          </div>
        </Col>

        <Col span={6}>
          <div className="dashboard-card gradient-3">
            <CheckCircleOutlined className="card-icon" />
            <h3>{data.totalTasks}</h3>
            <span>Total Tasks</span>
          </div>
        </Col>

        <Col span={6}>
          <div className="dashboard-card gradient-4">
            <ClockCircleOutlined className="card-icon" />
            <h3>{data.tasks.pending}</h3>
            <span>Pending Tasks</span>
          </div>
        </Col>
      </Row>

      {/* ===== CHART ===== */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        {/* BAR */}
        <Col span={12}>
          <Card className="chart-card" title="Task Overview">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={taskData}>
                <XAxis dataKey="name" stroke="#999" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* PIE */}
        <Col span={12}>
          <Card className="chart-card" title="Label Distribution">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={labelData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
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

export default ManagerDashboard;