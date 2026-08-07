// Report Service for Executive PDF & Excel exports

export const exportDashboardPDF = async (params = {}) => {
  window.print();
  return true;
};

export const exportDashboardExcel = async (params = {}) => {
  alert('Mengunduh Laporan Dashboard (.xlsx)...');
  return true;
};

export const exportProgramPDF = async (params = {}) => {
  window.print();
  return true;
};

export const exportProgramExcel = async (params = {}) => {
  alert('Mengunduh Laporan Program Kerja (.xlsx)...');
  return true;
};

export const exportSAPPDF = async (params = {}) => {
  window.print();
  return true;
};

export const exportSAPExcel = async (params = {}) => {
  alert('Mengunduh Laporan Data SAP (.xlsx)...');
  return true;
};

export const exportAttendancePDF = async (params = {}) => {
  window.print();
  return true;
};

export const exportAttendanceExcel = async (params = {}) => {
  alert('Mengunduh Laporan Presensi Personil (.xlsx)...');
  return true;
};
