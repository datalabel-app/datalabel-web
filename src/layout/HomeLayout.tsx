import React from "react";
import { Layout } from "antd";
import AppHeader from "../components/AppHeader";

const { Content } = Layout;

const HomeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout>
      <AppHeader />
      <Content style={{ padding: 24 }}>{children}</Content>
    </Layout>
  );
};

export default HomeLayout;
