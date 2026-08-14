const API_URL = import.meta.env.VITE_API_URL + '/api/dashboard';

export const getDashboardSummary = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/summary?${query}`);
  
  if (!res.ok) {
    throw new Error('Gagal mengambil data ringkasan dashboard');
  }

  return await res.json();
};

export const getManpowerList = async (date = null) => {
  try {
    let url = '/manpower';
    if (date) {
      url += `?date=${date}`;
    }
    const res = await fetch(API_URL + url);
    if (!res.ok) throw new Error('Failed to fetch manpower data');
    return await res.json();
  } catch (error) {
    console.error('getManpowerList error:', error);
    throw error;
  }
};
