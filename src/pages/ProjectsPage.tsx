import React from "react";
import { Row, Col, Card, Input, Button, Dropdown, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  FilterOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import "../styles/projects.css";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

interface Project {
  id: number;
  name: string;
  author: string;
  updatedAt: string;
}

const mockProjects: Project[] = [
  {
    id: 1,
    name: "sssss",
    author: "hai43",
    updatedAt: "2 months ago",
  },
];

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const cardMenuItems: MenuProps["items"] = [
    { key: "open", label: "Open" },
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete" },
  ];

  return (
    <div className="projects-container">
      {/* TOP BAR */}
      <div className="projects-toolbar">
        <div className="toolbar-left">
          <Input
            placeholder="Search ..."
            prefix={<SearchOutlined />}
            className="search-input"
          />
          <Button type="link">Select all</Button>
        </div>

        <div className="toolbar-right">
          <Button icon={<SortAscendingOutlined />}>Sort by</Button>
          <Button icon={<FilterOutlined />}>Quick filters</Button>
          <Button icon={<FilterOutlined />}>Filter</Button>
          <Button type="link">Clear filters</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/projects/create")}
          />
        </div>
      </div>

      {/* PROJECT GRID */}
      <Row gutter={[24, 24]}>
        {mockProjects.map((project) => (
          <Col
            key={project.id}
            xs={24}
            sm={12}
            md={8}
            lg={6}
            onClick={() => navigate(`/projects/${project.id}`)}
            style={{ cursor: "pointer" }}
          >
            <Card
              className="project-card"
              cover={<div className="project-image-placeholder">📷</div>}
            >
              <div className="card-content">
                <div>
                  <h4>{project.name}</h4>
                  <Text type="secondary">Created by {project.author}</Text>
                  <br />
                  <Text type="secondary">Last updated {project.updatedAt}</Text>
                </div>

                <Dropdown menu={{ items: cardMenuItems }} trigger={["click"]}>
                  <MoreOutlined className="card-menu-icon" />
                </Dropdown>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProjectsPage;
