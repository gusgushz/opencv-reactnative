import { API_KEY_NEWPORT, API_REPORTS_URL_NEWPORT } from 'dotenv';

const postAuthenticateValidDevice = async (androidId: string, key: string) => {
  try {
    const response = await fetch(`${API_REPORTS_URL_NEWPORT}/authenticate-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY_NEWPORT,
      },
      body: JSON.stringify({
        device_id: androidId,
        key: key,
      }),
    });
    const res = await response.json();
    if (res.status === 'error') return res;
    return res;
  } catch (error) {
    console.error('Error postAuthenticateDevice:', error);
    return { status: 'error', message: 'Error de red', detail: error };
  }
};
export default postAuthenticateValidDevice;
