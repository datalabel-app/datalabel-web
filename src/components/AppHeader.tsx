import React from "react";
import { Layout, Menu, Dropdown, Avatar, Space } from "antd";
import type { MenuProps } from "antd";
import {
  QuestionCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/header.css";

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/login");
      },
    },
  ];

  const menuItems: MenuProps["items"] = [
    { key: "/projects", label: "Projects" },
    { key: "/tasks", label: "Tasks" },
    { key: "/cloud", label: "Cloud Storages" },
    { key: "/requests", label: "Requests" },
    { key: "/models", label: "Models" },
  ];

  return (
    <Header className="app-header">
      <div className="header-left">
        <div className="logo" onClick={() => navigate("/projects")}>
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
        <QuestionCircleOutlined className="header-icon" />

        <Dropdown
          trigger={["click"]}
          menu={{
            items: userMenuItems,
            onClick: ({ key }) => {
              if (key === "profile") {
                navigate("/profile");
              }

              if (key === "settings") {
                navigate("/settings");
              }

              if (key === "logout") {
                localStorage.removeItem("token");
                navigate("/login");
              }
            },
          }}
        >
          <Space className="user-dropdown">
            <Avatar size="small" icon={<UserOutlined />} />
            <span className="username">User_1</span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
