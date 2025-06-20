import { AUTHORIZATION_KEY, API_BASE_URL } from 'dotenv';

const postKeyActivation = async (androidId: string, key: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/key/activation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        AuthorizationKey: AUTHORIZATION_KEY,
        //"auth-token": authorization
      },
      body: JSON.stringify({
        imei: androidId,
        key: key,
      }),
    });
    const res = await response.json();
    if (res.status === 'error') return res;
    return res;
  } catch (error) {
    console.error('Error postKeyActivation:', error);
    throw error;
  }
};
export default postKeyActivation;
