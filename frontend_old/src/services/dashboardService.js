const API_URL = 'import.meta.env.VITE_API_URL/api/dashboard';

export const getDashboardSummary = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/summary?${query}`);

  if (!res.ok) {
    throw new Error('Gagal mengambil data ringkasan dashboard');
  }

  return await res.json();
};

export const getManpowerList = async () => {
  const res = await fetch(`${API_URL}/manpower`);
  if (!res.ok) {
    throw new Error('Gagal mengambil data personil manpower');
  }
  return await res.json();
};
