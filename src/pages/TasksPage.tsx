import React from "react";
import {
  Input,
  Button,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Dropdown,
  Progress,
} from "antd";
import type { MenuProps } from "antd";
import { SearchOutlined, PlusOutlined, MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const actionItems: MenuProps["items"] = [
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete" },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* TOP BAR */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
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

      {/* TASK CARD */}
      <Card>
        <Row justify="space-between">
          <Col span={18}>
            <Space align="start">
              <div
                style={{
                  width: 120,
                  height: 70,
                  background: "#f0f0f0",
                }}
              />

              <div>
                <Title level={5} style={{ marginBottom: 4 }}>
                  #1931369: sss
                </Title>
                <Text type="secondary">
                  Created by the_an on January 14th 2026
                </Text>
                <br />
                <Text type="secondary">Last updated 2 months ago</Text>
              </div>
            </Space>
          </Col>

          <Col span={6} style={{ textAlign: "right" }}>
            <Text type="secondary">1 annotating • 1 total</Text>
            <Progress percent={50} showInfo={false} />

            <div style={{ marginTop: 12 }}>
              <Space>
                <Button type="primary" onClick={() => navigate("/annotate")}>
                  Open
                </Button>

                <Dropdown menu={{ items: actionItems }}>
                  <Button icon={<MoreOutlined />} />
                </Dropdown>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TasksPage;
