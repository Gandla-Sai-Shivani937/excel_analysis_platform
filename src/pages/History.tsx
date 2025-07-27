import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, FileText, Calendar, Download } from 'lucide-react';

const History: React.FC = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'analyses' | 'files'>('analyses');

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      // Fetch analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from('analyses')
        .select(`
          *,
          uploaded_files(original_name)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (analysesError) throw analysesError;

      // Fetch files
      const { data: filesData, error: filesError } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('user_id', user!.id)
        .order('upload_date', { ascending: false });

      if (filesError) throw filesError;

      setAnalyses(analysesData || []);
      setFiles(filesData || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">History</h1>
        <p className="text-gray-600">View your uploaded files and created analyses.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('analyses')}
            className={`px-6 py-4 font-medium transition-colors duration-200 ${
              activeTab === 'analyses'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={20} />
              Analyses ({analyses.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-6 py-4 font-medium transition-colors duration-200 ${
              activeTab === 'files'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={20} />
              Files ({files.length})
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'analyses' ? (
            analyses.length > 0 ? (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {analysis.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          File: {analysis.uploaded_files?.original_name || 'Unknown'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        analysis.chart_type === 'bar' ? 'bg-blue-100 text-blue-800' :
                        analysis.chart_type === 'line' ? 'bg-green-100 text-green-800' :
                        analysis.chart_type === 'pie' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {analysis.chart_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">X-Axis:</span>
                        <p className="font-medium text-gray-800">{analysis.x_column}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Y-Axis:</span>
                        <p className="font-medium text-gray-800">{analysis.y_column}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p className="font-medium text-gray-800">
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          View Chart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 mb-2">No analyses created yet</p>
                <p className="text-sm text-gray-400">Start by uploading a file and creating your first chart</p>
              </div>
            )
          ) : (
            files.length > 0 ? (
              <div className="space-y-4">
                {files.map((file) => (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <FileText className="text-blue-600" size={24} />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {file.original_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(file.upload_date).toLocaleDateString()}
                            </span>
                            <span>{formatFileSize(file.file_size)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          file.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : file.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {file.status}
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 mb-2">No files uploaded yet</p>
                <p className="text-sm text-gray-400">Upload your first Excel file to get started</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default History;