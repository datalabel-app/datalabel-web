import React from "react";
import { Layout, Menu, Dropdown, Avatar, Space } from "antd";
import type { MenuProps } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/header.css";
import { Badge, List } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useNotification } from "../hook/useNotification";
const { Header } = Layout;

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications } = useNotification();
  const role = Number(localStorage.getItem("role"));
  const userEmail = localStorage.getItem("user");

  // =========================
  // USER DROPDOWN MENU
  // =========================

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },

    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
    },
  ];

  const menuItems: MenuProps["items"] = [];

  // ADMIN
  if (role === 1) {
    menuItems.push({
      key: "/user-manage",
      label: "User Manage",
    });
    menuItems.push({
      key: "/dashboard",
      label: "Dashboard",
    });
  }

  // MANAGER
  if (role === 2) {
    menuItems.push(
      {
        key: "/projects",
        label: "Projects",
      },
      {
        key: "/dashboard-manager",
        label: "Dashboard",
      },
    );
  }
  if (role === 3) {
    menuItems.push(
      { key: "/tasks", label: "Tasks" },
      { key: "/request-labels", label: "Requests" },
    );
  }
  if (role === 4) {
    menuItems.push({ key: "/tasks", label: "Tasks" });
  }

  return (
    <Header className="app-header">
      <div className="header-left">
        <div
          className="logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          SWP
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          className="nav-menu"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </div>

      <div className="header-right">
        <Dropdown
          trigger={["click"]}
          dropdownRender={() => (
            <div
              style={{
                width: 300,
                maxHeight: 400,
                overflow: "auto",
                background: "#fff",
                borderRadius: 8,
                padding: 10,
              }}
            >
              <List
                dataSource={notifications}
                locale={{ emptyText: "No notifications" }}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      <b>Task #{item.taskId}</b>
                      <div style={{ fontSize: 12 }}>
                        {item.error || item.message}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )}
        >
          <Badge count={notifications.length} size="small">
            <BellOutlined className="header-icon" />
          </Badge>
        </Dropdown>

        <Dropdown
          trigger={["click"]}
          menu={{
            items: userMenuItems,
            onClick: ({ key }) => {
              if (key === "profile") navigate("/profile");

              if (key === "settings") navigate("/settings");

              if (key === "logout") {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user");

                navigate("/login");
              }
            },
          }}
        >
          <Space className="user-dropdown">
            <Avatar size="small" icon={<UserOutlined />} />
            <span className="username">{userEmail}</span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
