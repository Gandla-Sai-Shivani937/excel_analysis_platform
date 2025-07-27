import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import { parseExcelFile } from '../../lib/excelParser';
import { supabase, uploadFile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileUploaded: (fileId: string, data: any) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx?|csv)$/i)) {
      toast.error('Please upload a valid Excel file (.xlsx, .xls)');
      return;
    }

    setUploading(true);
    setUploadStatus('processing');

    try {
      // Parse the Excel file
      const excelData = await parseExcelFile(file);
      
      // Upload file to Supabase storage
      const storageData = await uploadFile(file, user!.id);
      
      // Save file record to database
      const { data: fileRecord, error } = await supabase
        .from('uploaded_files')
        .insert([
          {
            user_id: user!.id,
            filename: storageData.path,
            original_name: file.name,
            file_size: file.size,
            status: 'completed'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setUploadStatus('success');
      toast.success('File uploaded successfully!');
      onFileUploaded(fileRecord.id, excelData);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'processing':
        return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircle className="text-green-600" size={32} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={32} />;
      default:
        return <Upload className="text-gray-400" size={32} />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'processing':
        return 'Processing file...';
      case 'success':
        return 'File uploaded successfully!';
      case 'error':
        return 'Upload failed. Please try again.';
      default:
        return 'Upload your Excel file';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Excel File</h2>
      
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : uploadStatus === 'success'
            ? 'border-green-500 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {getStatusText()}
            </h3>
            {uploadStatus === 'idle' && (
              <p className="text-gray-600">
                Drag and drop your Excel file here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  browse files
                </button>
              </p>
            )}
          </div>

          {uploadStatus === 'idle' && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <File size={16} />
              <span>Supports .xlsx, .xls files</span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploadStatus === 'success' && (
        <button
          onClick={() => {
            setUploadStatus('idle');
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Upload Another File
        </button>
      )}
    </div>
  );
};

export default FileUpload;