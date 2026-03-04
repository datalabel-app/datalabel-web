import React from "react";
import {
  Card,
  Typography,
  Button,
  Space,
  Tabs,
  Tag,
  Select,
  Row,
  Col,
  Input,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      {/* BACK */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/projects")}
        style={{ padding: 0 }}
      >
        Back to projects
      </Button>

      {/* PROJECT INFO CARD */}
      <Card style={{ marginTop: 16 }}>
        {/* TITLE */}
        <Row justify="space-between" align="middle">
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              sssss
            </Title>
            <EditOutlined style={{ cursor: "pointer" }} />
          </Space>

          <Button>Actions</Button>
        </Row>

        <Text type="secondary">
          Project #356706 created by the_an on March 1st 2026
        </Text>

        {/* ASSIGNED */}
        <Row justify="space-between" style={{ marginTop: 16 }}>
          <Col>
            <Text strong>Project description</Text>
            <div style={{ marginTop: 8 }}>
              <Button size="small">Edit</Button>
            </div>
          </Col>

          <Col>
            <Space>
              <Text>Assigned to</Text>
              <Select
                placeholder="Select a user"
                style={{ width: 200 }}
                options={[
                  { label: "the_an", value: "the_an" },
                  { label: "admin", value: "admin" },
                ]}
              />
            </Space>
          </Col>
        </Row>

        {/* ISSUE TRACKER */}
        <div style={{ marginTop: 24 }}>
          <Space>
            <Text strong>Issue Tracker</Text>
            <EditOutlined />
          </Space>
        </div>

        {/* LABELS */}
        <div style={{ marginTop: 16 }}>
          <Tabs
            defaultActiveKey="raw"
            items={[
              {
                key: "raw",
                label: "Raw",
                children: (
                  <>
                    <Space wrap style={{ marginBottom: 16 }}>
                      <Button size="small" icon={<PlusOutlined />}>
                        Add label
                      </Button>
                      <Button size="small" icon={<PlusOutlined />}>
                        Setup skeleton
                      </Button>
                      <Button size="small" icon={<PlusOutlined />}>
                        From model
                      </Button>

                      <Tag color="green">
                        asss <EditOutlined />
                      </Tag>

                      <Tag color="gold">
                        sss <EditOutlined />
                      </Tag>
                    </Space>
                  </>
                ),
              },
              {
                key: "constructor",
                label: "Constructor",
                children: <div>Constructor config here...</div>,
              },
            ]}
          />
        </div>
      </Card>

      {/* TASK TOOLBAR */}
      <div style={{ marginTop: 24 }}>
        <Row justify="space-between">
          <Space>
            <Input
              placeholder="Search ..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
            />
            <Button type="link">Select all</Button>
          </Space>

          <Space>
            <Button>Sort by</Button>
            <Button>Quick filters</Button>
            <Button>Filter</Button>
            <Button type="link">Clear filters</Button>
            <Button type="primary" icon={<PlusOutlined />} />
          </Space>
        </Row>
      </div>

      {/* EMPTY STATE */}
      <div style={{ marginTop: 60, textAlign: "center" }}>
        <Empty description="No tasks found" />
      </div>
    </div>
  );
};

export default ProjectDetailPage;
