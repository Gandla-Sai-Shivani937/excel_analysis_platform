import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ChartBuilder from '../components/Charts/ChartBuilder';
import { FileText } from 'lucide-react';

const Analyze: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileData, setFileData] = useState<any>(null);

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'completed')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileSelect = async (file: any) => {
    setSelectedFile(file);
    // In a real app, you'd fetch the parsed data from storage or cache
    // For now, we'll show a placeholder
    setFileData({
      headers: ['Column A', 'Column B', 'Column C'],
      rows: [
        ['Value 1', 10, 20],
        ['Value 2', 15, 25],
        ['Value 3', 20, 30],
      ]
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analyze Data</h1>
        <p className="text-gray-600">Select a file to create charts and visualizations.</p>
      </div>

      {!selectedFile ? (
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Select a File to Analyze</h2>
          
          {files.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => handleFileSelect(file)}
                  className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="text-blue-600" size={24} />
                    <h3 className="font-medium text-gray-800 truncate">{file.original_name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Uploaded: {new Date(file.upload_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Size: {(file.file_size / 1024).toFixed(1)} KB
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 mb-4">No files available for analysis</p>
              <p className="text-sm text-gray-400">Upload some Excel files first to get started</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Analyzing: {selectedFile.original_name}</h2>
                <p className="text-gray-600">Create charts and visualizations from your data</p>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setFileData(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Back to Files
              </button>
            </div>
          </div>

          {fileData && (
            <ChartBuilder data={fileData} fileId={selectedFile.id} />
          )}
        </div>
      )}
    </div>
  );
};

export default Analyze;