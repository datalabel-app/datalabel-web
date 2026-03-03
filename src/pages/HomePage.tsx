import React from "react";
import { Layout } from "antd";
import AppHeader from "../components/AppHeader";

const { Content } = Layout;

const HomePage: React.FC = () => {
  return (
    <Layout>
      <AppHeader />
      <Content style={{ padding: 24 }}>
        <h2>Welcome to Home</h2>
      </Content>
    </Layout>
  );
};

export default HomePage;
