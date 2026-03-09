import React from "react";
import { Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { PlusOutlined } from "@ant-design/icons";

interface Props {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const DatasetUploader: React.FC<Props> = ({ files, setFiles }) => {
  const fileList: UploadFile[] = files.map((file, index) => ({
    uid: index.toString(),
    name: file.name,
    status: "done",
    url: URL.createObjectURL(file),
  }));

  const handleChange = ({ fileList }: any) => {
    const newFiles = fileList.map((file: any) => file.originFileObj);
    setFiles(newFiles);
  };

  return (
    <Upload
      multiple
      listType="picture-card"
      beforeUpload={() => false}
      fileList={fileList}
      onChange={handleChange}
    >
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    </Upload>
  );
};

export default DatasetUploader;
