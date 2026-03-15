import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  Divider,
  Select,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";

import DatasetUploader from "../components/DatasetUploader";

import { DatasetService } from "../services/dataset.service";
import { DatasetRoundService } from "../services/datasetround.service";
import { LabelService } from "../services/label.service";
import { UploadService } from "../services/upload.service";
import { DataItemService } from "../services/dataitem.service";

const { Title } = Typography;
const { Option } = Select;

interface UploadedImage {
  url: string;
  publicId: string;
}

interface LabelItem {
  labelName: string;
}

interface RoundItem {
  roundNumber: number;
  description?: string;
  shapeType: number;
  labels: LabelItem[];
}

const CreateDatasetPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ADD ROUND
  const addRound = () => {
    setRounds([
      ...rounds,
      {
        roundNumber: rounds.length + 1,
        description: "",
        shapeType: 0,
        labels: [],
      },
    ]);
  };

  // REMOVE ROUND
  const removeRound = (index: number) => {
    const newRounds = [...rounds];
    newRounds.splice(index, 1);
    setRounds(newRounds);
  };

  // UPDATE ROUND DESCRIPTION
  const updateRoundDescription = (index: number, value: string) => {
    const newRounds = [...rounds];
    newRounds[index].description = value;
    setRounds(newRounds);
  };

  // UPDATE SHAPETYPE
  const updateShapeType = (index: number, value: number) => {
    const newRounds = [...rounds];
    newRounds[index].shapeType = value;
    setRounds(newRounds);
  };

  // ADD LABEL
  const addLabel = (roundIndex: number) => {
    const newRounds = [...rounds];
    newRounds[roundIndex].labels.push({ labelName: "" });
    setRounds(newRounds);
  };

  // UPDATE LABEL
  const updateLabel = (
    roundIndex: number,
    labelIndex: number,
    value: string,
  ) => {
    const newRounds = [...rounds];
    newRounds[roundIndex].labels[labelIndex].labelName = value;
    setRounds(newRounds);
  };

  // REMOVE LABEL
  const removeLabel = (roundIndex: number, labelIndex: number) => {
    const newRounds = [...rounds];
    newRounds[roundIndex].labels.splice(labelIndex, 1);
    setRounds(newRounds);
  };

  const onFinish = async (values: any) => {
    try {
      if (files.length === 0) {
        message.warning("Please upload at least 1 image");
        return;
      }

      setLoading(true);

      // 1 CREATE DATASET
      const datasetRes = await DatasetService.create({
        projectId: Number(id),
        datasetName: values.datasetName,
        status: "Active",
      });

      const datasetId = datasetRes.datasetId;

      // 2 CREATE ROUNDS + LABELS
      for (const round of rounds) {
        const roundRes = await DatasetRoundService.create({
          datasetId: datasetId,
          roundNumber: round.roundNumber,
          description: round.description,
          shapeType: round.shapeType,
          status: "Active",
        });

        const roundId = roundRes.roundId;

        if (round.labels.length > 0) {
          await Promise.all(
            round.labels.map((label) =>
              LabelService.create({
                roundId: roundId,
                labelName: label.labelName,
              }),
            ),
          );
        }
      }

      // 3 UPLOAD IMAGES
      const uploadRes = await UploadService.uploadImages(files);

      const images: UploadedImage[] = uploadRes.urls || uploadRes;

      // 4 CREATE DATAITEM
      await Promise.all(
        images.map((img) =>
          DataItemService.create({
            datasetId: datasetId,
            fileUrl: img.url,
            status: 0,
          }),
        ),
      );

      message.success("Dataset created successfully");

      navigate(`/projects/${id}`);
    } catch (error) {
      console.error(error);
      message.error("Create dataset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 40,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card style={{ width: 800 }}>
        <Title level={3}>Create Dataset</Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Dataset Name"
            name="datasetName"
            rules={[{ required: true, message: "Please input dataset name" }]}
          >
            <Input placeholder="Dataset name" />
          </Form.Item>

          <Divider>Rounds & Labels</Divider>

          <Space direction="vertical" style={{ width: "100%" }}>
            <Button onClick={addRound}>Add Round</Button>

            {rounds.map((round, roundIndex) => (
              <Card
                key={roundIndex}
                size="small"
                title={`Round ${round.roundNumber}`}
                extra={
                  <Button danger onClick={() => removeRound(roundIndex)}>
                    Delete Round
                  </Button>
                }
              >
                <Form.Item label="Description">
                  <Input
                    placeholder="Round description"
                    value={round.description}
                    onChange={(e) =>
                      updateRoundDescription(roundIndex, e.target.value)
                    }
                  />
                </Form.Item>

                <Form.Item label="Shape Type">
                  <Select
                    value={round.shapeType}
                    onChange={(value) => updateShapeType(roundIndex, value)}
                  >
                    <Option value={0}>Bounding Box</Option>
                    <Option value={1}>Classification</Option>
                  </Select>
                </Form.Item>

                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button onClick={() => addLabel(roundIndex)}>
                    Add Label
                  </Button>

                  {round.labels.map((label, labelIndex) => (
                    <Space key={labelIndex} style={{ width: "100%" }}>
                      <Input
                        placeholder="Label name"
                        value={label.labelName}
                        onChange={(e) =>
                          updateLabel(roundIndex, labelIndex, e.target.value)
                        }
                      />

                      <Button
                        danger
                        onClick={() => removeLabel(roundIndex, labelIndex)}
                      >
                        Delete
                      </Button>
                    </Space>
                  ))}
                </Space>
              </Card>
            ))}
          </Space>

          <Divider>Upload Images</Divider>

          <Form.Item>
            <DatasetUploader files={files} setFiles={setFiles} />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Create Dataset
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CreateDatasetPage;
