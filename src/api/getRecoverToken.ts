import { AUTHORIZATION_KEY, API_REPORTS_URL } from 'dotenv';

const getRecoverToken = async (chain: string) => {
  try {
    const response = await fetch(`${API_REPORTS_URL}/device/token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization_key: AUTHORIZATION_KEY,
        //"auth-token": authorization
      },
      body: JSON.stringify({
        chain: chain,
      }),
    });
    const res = await response.json();
    // const res = await response.text();
    console.log('getRecoverToken response:', res);
    if (res.status === 'error') return res;
    return res;
  } catch (error) {
    console.error('Error getRecoverToken:', error);
    throw error;
  }
};
export default getRecoverToken;
