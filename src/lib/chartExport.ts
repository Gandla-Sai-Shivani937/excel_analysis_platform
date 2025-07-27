import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportChartAsPNG = async (chartElement: HTMLCanvasElement, filename: string) => {
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = chartElement.toDataURL('image/png');
  link.click();
};

export const exportChartAsPDF = async (chartElement: HTMLElement, filename: string) => {
  const canvas = await html2canvas(chartElement, {
    backgroundColor: '#ffffff',
    scale: 2
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  
  const imgWidth = 190;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  
  let position = 10;
  
  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  pdf.save(`${filename}.pdf`);
};