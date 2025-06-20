import { API_BASE_URL, AUTHORIZATION_KEY } from 'dotenv';
import config from '../config/app.json';

const getUpdateByTimestamp = async (stateId: string, lastUpdated?: string) => {
  try {
    const lastUpdatedDefault = '2000-05-15 20:23:41';
    const response = await fetch(
      `${API_BASE_URL}/updateByTimestamp?` + new URLSearchParams({ state_id: stateId, lastUpdated: lastUpdated ?? lastUpdatedDefault }).toString(),
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', AuthorizationKey: AUTHORIZATION_KEY },
      },
    );
    const res = await response.json();
    if (res.status === 'error') return res;
    return res;
  } catch (error) {
    console.error('Error getUpdateByTimestamp:', error);
    return { status: 'error', message: 'Error de red', detail: error };
  }
};
export default getUpdateByTimestamp;
