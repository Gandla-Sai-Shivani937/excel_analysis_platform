import React, { useState, useRef } from 'react';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Download, Save } from 'lucide-react';
import { exportChartAsPNG, exportChartAsPDF } from '../../lib/chartExport';
import { processDataForChart } from '../../lib/excelParser';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartBuilderProps {
  data: any;
  fileId: string;
}

const ChartBuilder: React.FC<ChartBuilderProps> = ({ data, fileId }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [xColumn, setXColumn] = useState(data.headers[0] || '');
  const [yColumn, setYColumn] = useState(data.headers[1] || '');
  const [chartTitle, setChartTitle] = useState('My Chart');
  const chartRef = useRef<any>(null);
  const { user } = useAuth();

  const processedData = React.useMemo(() => {
    if (!xColumn || !yColumn) return null;

    try {
      const processed = processDataForChart(data, xColumn, yColumn, chartType);
      
      const labels = processed.map(item => String(item.x));
      const values = processed.map(item => item.y);

      const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ];

      return {
        labels,
        datasets: [
          {
            label: yColumn,
            data: values,
            backgroundColor: chartType === 'pie' ? colors : colors[0],
            borderColor: chartType === 'pie' ? colors : colors[0],
            borderWidth: chartType === 'line' ? 2 : 1,
            fill: chartType === 'line' ? false : undefined,
          },
        ],
      };
    } catch (error) {
      console.error('Error processing data:', error);
      return null;
    }
  }, [data, xColumn, yColumn, chartType]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: chartTitle,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: chartType !== 'pie' ? {
      y: {
        beginAtZero: true,
      },
    } : undefined,
  };

  const renderChart = () => {
    if (!processedData) return null;

    const chartProps = {
      ref: chartRef,
      data: processedData,
      options: chartOptions,
    };

    switch (chartType) {
      case 'bar':
        return <Bar {...chartProps} />;
      case 'line':
        return <Line {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'scatter':
        return <Scatter {...chartProps} />;
      default:
        return <Bar {...chartProps} />;
    }
  };

  const handleSaveAnalysis = async () => {
    try {
      const { error } = await supabase
        .from('analyses')
        .insert([
          {
            user_id: user!.id,
            file_id: fileId,
            chart_type: chartType,
            x_column: xColumn,
            y_column: yColumn,
            title: chartTitle,
            chart_config: {
              options: chartOptions,
              data: processedData,
            },
          },
        ]);

      if (error) throw error;
      toast.success('Analysis saved successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Failed to save analysis');
    }
  };

  const handleExportPNG = () => {
    if (chartRef.current) {
      exportChartAsPNG(chartRef.current.canvas, chartTitle);
    }
  };

  const handleExportPDF = () => {
    if (chartRef.current) {
      exportChartAsPDF(chartRef.current.canvas.parentElement, chartTitle);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <div className="lg:w-1/3 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Chart Builder</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Title
            </label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Type
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="scatter">Scatter Plot</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X-Axis Column
            </label>
            <select
              value={xColumn}
              onChange={(e) => setXColumn(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {data.headers.map((header: string) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Y-Axis Column
            </label>
            <select
              value={yColumn}
              onChange={(e) => setYColumn(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {data.headers.map((header: string) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSaveAnalysis}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save Analysis
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleExportPNG}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                PNG
              </button>
              <button
                onClick={handleExportPDF}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Chart Display */}
        <div className="lg:w-2/3">
          <div className="bg-gray-50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
            {processedData ? (
              renderChart()
            ) : (
              <p className="text-gray-500">Select columns to generate chart</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartBuilder;