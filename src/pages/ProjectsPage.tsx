import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Dropdown,
  Typography,
  Spin,
  message,
} from "antd";
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
import { ProjectService } from "../services/project.service";

const { Text } = Typography;

interface Project {
  projectId: number;
  projectName: string;
  description: string;
  createdBy?: string;
  createdAt?: string;
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const res = await ProjectService.getAll({});

      setProjects(res || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const cardMenuItems: MenuProps["items"] = [
    { key: "open", label: "Open" },
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete" },
  ];

  return (
    <div className="projects-container">
      {/* TOOLBAR */}
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

      {/* PROJECT LIST */}
      {loading ? (
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {projects.map((project) => (
            <Col
              key={project.projectId}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              onClick={() => navigate(`/projects/${project.projectId}`)}
              style={{ cursor: "pointer" }}
            >
              <Card
                className="project-card"
                hoverable
                cover={<div className="project-image-placeholder">📷</div>}
              >
                <div className="card-content">
                  <div>
                    <h4>{project.projectName}</h4>

                    <Text type="secondary">
                      Created by {project.createdBy || "Unknown"}
                    </Text>
                    <br />

                    <Text type="secondary">
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleDateString()
                        : ""}
                    </Text>
                  </div>

                  <Dropdown menu={{ items: cardMenuItems }} trigger={["click"]}>
                    <MoreOutlined className="card-menu-icon" />
                  </Dropdown>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ProjectsPage;
