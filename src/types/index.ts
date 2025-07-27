export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface UploadedFile {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  file_size: number;
  upload_date: string;
  status: 'processing' | 'completed' | 'error';
}

export interface Analysis {
  id: string;
  user_id: string;
  file_id: string;
  chart_type: 'bar' | 'line' | 'pie' | 'scatter' | '3d-column';
  x_column: string;
  y_column: string;
  chart_config: any;
  created_at: string;
  title: string;
}

export interface ExcelData {
  headers: string[];
  rows: any[][];
  sheetNames: string[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}