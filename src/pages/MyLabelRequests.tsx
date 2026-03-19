import React, { useEffect, useState } from "react";
import { Table, Tag, Card, Typography, Spin, message } from "antd";
import { LabelService } from "../services/label.service";
import "../styles/my-label.css";

const { Title } = Typography;

interface Label {
  labelId: number;
  labelName: string;
  description: string | null;
  labelStatus: number;
  round: {
    roundId: number;
    roundNumber: number;
    shapeType: number;
    description: string;
  };
  dataset: {
    datasetId: number;
    datasetName: string;
  };
  project: {
    projectId: number;
    projectName: string;
  };
}

const STATUS_MAP: Record<number, { text: string; color: string }> = {
  0: { text: "Pending", color: "gold" },
  1: { text: "Approved", color: "green" },
  2: { text: "Rejected", color: "red" },
};

const SHAPE_MAP: Record<number, string> = {
  0: "BBox",
  1: "Classfication",
};

const MyLabelRequests: React.FC = () => {
  const [data, setData] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await LabelService.getMyLabelRequest();
      setData(res);
    } catch (error) {
      message.error("Load label thất bại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "labelId",
      key: "labelId",
      width: 80,
    },
    {
      title: "Label Name",
      dataIndex: "labelName",
      key: "labelName",
    },

    {
      title: "Status",
      dataIndex: "labelStatus",
      key: "labelStatus",
      render: (status: number) => {
        const item = STATUS_MAP[status];
        return <Tag color={item?.color}>{item?.text}</Tag>;
      },
    },
    {
      title: "Round",
      render: (_: any, record: Label) => record.round?.roundNumber,
    },
    {
      title: "Shape",
      render: (_: any, record: Label) => SHAPE_MAP[record.round?.shapeType],
    },
    {
      title: "Dataset",
      render: (_: any, record: Label) => record.dataset?.datasetName,
    },
    {
      title: "Project",
      render: (_: any, record: Label) => record.project?.projectName,
    },
  ];

  return (
    <div className="my-label-container">
      <Card className="my-label-card">
        <Title level={3}>My Label Requests</Title>

        {loading ? (
          <div className="loading">
            <Spin />
          </div>
        ) : (
          <Table
            rowKey="labelId"
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 6 }}
          />
        )}
      </Card>
    </div>
  );
};

export default MyLabelRequests;
