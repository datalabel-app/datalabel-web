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
  Pagination,
  Tag,
  DatePicker,
} from "antd";
import type { MenuProps } from "antd";
import { SearchOutlined, PlusOutlined, MoreOutlined } from "@ant-design/icons";
import "../styles/projects.css";
import { useNavigate } from "react-router-dom";
import { ProjectService } from "../services/project.service";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const PAGE_SIZE = 8;

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  // const [sortType, setSortType] = useState<"newest" | null>(null);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ================= FETCH =================
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await ProjectService.getByManager();
      setProjects(res || []);
    } catch {
      message.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ================= FILTER + SORT =================
  const filtered = projects.filter((p) => {
    const matchName = p.projectName
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchDate = selectedDate
      ? dayjs(p.createdAt).isSame(selectedDate, "day")
      : true;

    return matchName && matchDate;
  });
  // .sort((a, b) => {
  //   if (sortType === "newest") {
  //     return (
  //       new Date(b.createdAt || 0).getTime() -
  //       new Date(a.createdAt || 0).getTime()
  //     );
  //   }
  //   return 0;
  // });

  // ================= PAGINATION =================
  const paginatedData = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleDelete = async (id: number) => {
    try {
      await ProjectService.delete(id);
      message.success("Deleted!");
      fetchProjects();
    } catch {
      message.error("Delete failed");
    }
  };

  const getMenu = (project: any): MenuProps => ({
    items: [
      {
        key: "open",
        label: "Open",
        onClick: () => navigate(`/projects/${project.projectId}`),
      },
      {
        key: "edit",
        label: "Edit",
        onClick: () => navigate(`/projects/${project.projectId}`),
      },
      {
        key: "delete",
        label: "Delete",
        danger: true,
        onClick: () => handleDelete(project.projectId),
      },
    ],
  });

  return (
    <div className="projects-container">
      {/* HEADER */}
      <div className="projects-header">
        <Title level={3}>Projects</Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/projects/create")}
        >
          New Project
        </Button>
      </div>

      {/* TOOLBAR */}
      <div className="projects-toolbar">
        <Input
          placeholder="Search project..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />

        <DatePicker
          placeholder="Filter by date"
          onChange={(date) => {
            setSelectedDate(date);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="center">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[20, 20]}>
            {paginatedData.map((project) => (
              <Col xs={24} sm={12} md={8} lg={6} key={project.projectId}>
                <Card
                  className="project-card"
                  hoverable
                  onClick={() => navigate(`/projects/${project.projectId}`)}
                >
                  <div className="card-content">
                    <div>
                      <Title level={5} className="title">
                        {project.projectName}
                      </Title>

                      <Text type="secondary">{project.description}</Text>

                      <div className="meta">
                        <Text type="secondary">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </Text>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <Tag color="blue">{project.datasetCount} datasets</Tag>
                      </div>
                    </div>

                    <Dropdown menu={getMenu(project)} trigger={["click"]}>
                      <MoreOutlined
                        className="menu-icon"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* PAGINATION */}
          <div className="pagination">
            <Pagination
              current={currentPage}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectsPage;
