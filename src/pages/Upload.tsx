import React, { useState } from 'react';
import FileUpload from '../components/Upload/FileUpload';
import ChartBuilder from '../components/Charts/ChartBuilder';

const Upload: React.FC = () => {
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [fileId, setFileId] = useState<string>('');

  const handleFileUploaded = (id: string, data: any) => {
    setFileId(id);
    setUploadedData(data);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload & Analyze</h1>
        <p className="text-gray-600">Upload your Excel files and create beautiful visualizations.</p>
      </div>

      <div className="space-y-8">
        <FileUpload onFileUploaded={handleFileUploaded} />
        
        {uploadedData && (
          <ChartBuilder data={uploadedData} fileId={fileId} />
        )}
      </div>
    </div>
  );
};

export default Upload;