import api from '../api/axios';

export const downloadBlob = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const logExport = (details, level = 'info') => {
  api.post('/logs', {
    action: 'DATA_EXPORT',
    details,
    level
  }).catch(console.error);
};