import React, { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import DatasetUploader from "../components/DatasetUploader";
import { DatasetService } from "../services/dataset.service";
import { DataitemService } from "../services/dataitem.service";
import { UploadService } from "../services/upload.service";

interface UploadedImage {
  url: string;
  publicId: string;
}

const CreateDatasetPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      if (files.length === 0) {
        message.warning("Please upload at least 1 image");
        return;
      }

      setLoading(true);

      // Create dataset
      const datasetRes = await DatasetService.create({
        projectId: Number(id),
        datasetName: values.datasetName,
        status: "active",
      });

      const datasetId = datasetRes.datasetId || datasetRes.id;

      // Upload images
      const uploadRes = await UploadService.uploadImages(files);

      const images: UploadedImage[] = uploadRes.urls || uploadRes;

      // Create dataitems
      await Promise.all(
        images.map((img) =>
          DataitemService.create({
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
      <Card
        title="Create Dataset"
        style={{
          width: 700,
        }}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Dataset Name"
            name="datasetName"
            rules={[{ required: true, message: "Please input dataset name" }]}
          >
            <Input placeholder="Dataset name" />
          </Form.Item>

          <Form.Item label="Upload Images">
            <DatasetUploader files={files} setFiles={setFiles} />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
          >
            Create Dataset
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CreateDatasetPage;
