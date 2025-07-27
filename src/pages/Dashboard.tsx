import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import StatsCards from '../components/Dashboard/StatsCards';
import { FileText, BarChart3, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalAnalyses: 0,
    totalUsers: 0,
  });
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's files
      const { data: files } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('user_id', user!.id)
        .order('upload_date', { ascending: false });

      // Fetch user's analyses
      const { data: analyses } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      // Fetch total users if admin
      let totalUsers = 0;
      if (user?.role === 'admin') {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        totalUsers = count || 0;
      }

      setStats({
        totalFiles: files?.length || 0,
        totalAnalyses: analyses?.length || 0,
        totalUsers,
      });

      setRecentFiles(files?.slice(0, 5) || []);
      setRecentAnalyses(analyses?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your data analytics.</p>
      </div>

      <StatsCards
        totalFiles={stats.totalFiles}
        totalAnalyses={stats.totalAnalyses}
        totalUsers={user?.role === 'admin' ? stats.totalUsers : undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Files */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Recent Files</h2>
          </div>

          {recentFiles.length > 0 ? (
            <div className="space-y-4">
              {recentFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">{file.original_name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(file.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    file.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : file.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {file.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
          )}
        </div>

        {/* Recent Analyses */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Recent Analyses</h2>
          </div>

          {recentAnalyses.length > 0 ? (
            <div className="space-y-4">
              {recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">{analysis.title}</h3>
                    <p className="text-sm text-gray-600">
                      {analysis.chart_type} • {new Date(analysis.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Clock className="text-gray-400" size={16} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No analyses created yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;