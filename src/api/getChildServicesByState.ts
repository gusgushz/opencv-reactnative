import { API_BASE_URL, AUTHORIZATION_KEY } from 'dotenv';
const serch = new URLSearchParams();
const getChildServicesByState = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/getChildServicesByState`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', AuthorizationKey: AUTHORIZATION_KEY },
    });
    const res = await response.json();
    if (res.status === 'error') return res;
    return res;
  } catch (error) {
    console.error('Error getChildServicesByState:', error);
    return { status: 'error', message: 'Error de red', detail: error };
  }
};
export default getChildServicesByState;
