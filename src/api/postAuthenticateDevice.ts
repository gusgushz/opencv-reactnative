import { AUTHORIZATION_KEY, API_REPORTS_URL } from 'dotenv';

const postAuthenticateDevice = async (chain: string) => {
  try {
    const response = await fetch(`${API_REPORTS_URL}/device/authentication`, {
      method: 'POST',
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
    if (res.status === 'error') return res;
    return res;
  } catch (error) {
    console.error('Error postAuthenticateDevice:', error);
    throw error;
  }
};
export default postAuthenticateDevice;
