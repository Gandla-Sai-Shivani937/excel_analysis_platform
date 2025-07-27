import React from 'react';
import { FileText, BarChart3, Users, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  totalFiles: number;
  totalAnalyses: number;
  totalUsers?: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ totalFiles, totalAnalyses, totalUsers }) => {
  const stats = [
    {
      title: 'Total Files',
      value: totalFiles,
      icon: FileText,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Analyses Created',
      value: totalAnalyses,
      icon: BarChart3,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'Active Charts',
      value: Math.floor(totalAnalyses * 0.8),
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: '+15%',
    },
    ...(totalUsers !== undefined ? [{
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'bg-orange-500',
      trend: '+5%',
    }] : []),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <p className="text-green-600 text-sm font-medium mt-2">{stat.trend} from last month</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;