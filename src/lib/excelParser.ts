import * as XLSX from 'xlsx';
import { ExcelData } from '../types';

export const parseExcelFile = async (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetNames = workbook.SheetNames;
        const firstSheet = workbook.Sheets[sheetNames[0]];
        
        // Convert to JSON to get headers and rows
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          throw new Error('Empty Excel file');
        }
        
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);
        
        resolve({
          headers,
          rows,
          sheetNames
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const processDataForChart = (
  data: ExcelData,
  xColumn: string,
  yColumn: string,
  chartType: string
) => {
  const xIndex = data.headers.indexOf(xColumn);
  const yIndex = data.headers.indexOf(yColumn);
  
  if (xIndex === -1 || yIndex === -1) {
    throw new Error('Selected columns not found');
  }
  
  const processedData = data.rows
    .filter(row => row[xIndex] !== undefined && row[yIndex] !== undefined)
    .map(row => ({
      x: row[xIndex],
      y: parseFloat(row[yIndex]) || 0
    }));
    
  return processedData;
};