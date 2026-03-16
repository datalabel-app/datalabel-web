import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Input,
  Table,
  Spin,
  message,
  Tag,
} from "antd";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { DataItemService } from "../services/dataitem.service";

const { Title, Text } = Typography;

interface DataItem {
  itemId: number;
  datasetId: number;
  fileUrl: string;
  status: number;
  createdAt: string;
}

const DatasetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { datasetId } = useParams();

  const [dataItems, setDataItems] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchDataItems = async () => {
    try {
      setLoading(true);

      const res = await DataItemService.getByDataset(Number(datasetId));

      setDataItems(res || []);
    } catch (error) {
      message.error("Load dataset items failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datasetId) {
      fetchDataItems();
    }
  }, [datasetId]);

  const filteredData = dataItems.filter((item) =>
    item.fileUrl?.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      title: "ID",
      dataIndex: "itemId",
      key: "itemId",
      width: 80,
    },
    {
      title: "Image",
      dataIndex: "fileUrl",
      key: "fileUrl",
      render: (url: string) => (
        <img
          src={url}
          alt="data"
          style={{
            width: 90,
            height: 90,
            objectFit: "cover",
            borderRadius: 6,
            border: "1px solid #eee",
          }}
        />
      ),
    },
    {
      title: "File URL",
      dataIndex: "fileUrl",
      key: "fileUrl",
      render: (url: string) => (
        <a href={url} target="_blank" rel="noreferrer">
          Open Image
        </a>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: number) =>
        status === 0 ? (
          <Tag color="orange">Pending</Tag>
        ) : (
          <Tag color="green">Labeled</Tag>
        ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* BACK BUTTON */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ padding: 0 }}
      >
        Back
      </Button>

      {/* HEADER */}
      <Card style={{ marginTop: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Dataset #{datasetId}
            </Title>

            <Text type="secondary">Manage dataset images</Text>
          </Col>
        </Row>
      </Card>

      {/* SEARCH */}
      <Row style={{ marginTop: 20 }}>
        <Input
          placeholder="Search image..."
          prefix={<SearchOutlined />}
          style={{ width: 260 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Row>

      {/* TABLE */}
      <Card style={{ marginTop: 20 }}>
        <Table
          rowKey="itemId"
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
};

export default DatasetDetailPage;
