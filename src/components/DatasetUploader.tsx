import React, { useEffect, useState } from "react";
import { Upload, message } from "antd";
import type { UploadFile, UploadFileStatus } from "antd/es/upload/interface";
import { PlusOutlined } from "@ant-design/icons";

interface Props {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const DatasetUploader: React.FC<Props> = ({ files, setFiles }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Cập nhật fileList từ files
  useEffect(() => {
    const newList = files.map((file) => ({
      uid: file.name + file.lastModified, // uid ổn định
      name: file.name,
      status: "done" as UploadFileStatus,
      url: URL.createObjectURL(file),
      originFileObj: file as any,
    }));
    setFileList(newList);

    // Cleanup URL object khi unmount
    return () => {
      newList.forEach((f) => f.url && URL.revokeObjectURL(f.url));
    };
  }, [files]);

  // Chỉ chấp nhận ảnh
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error(`${file.name} is not an image file`);
    }
    return isImage ? true : Upload.LIST_IGNORE; // LIST_IGNORE để bỏ file ra khỏi list
  };

  const handleChange = ({ fileList: newFileList }: any) => {
    const newFiles = newFileList
      .map((file: any) => file.originFileObj)
      .filter(Boolean);
    setFiles(newFiles);
  };

  return (
    <Upload
      multiple
      listType="picture-card"
      beforeUpload={beforeUpload}
      fileList={fileList}
      onChange={handleChange}
      accept="image/*" // chỉ hiện chọn file ảnh
    >
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    </Upload>
  );
};

export default DatasetUploader;
