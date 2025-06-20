import { AUTHORIZATION_KEY, API_REPORTS_URL } from 'dotenv';

const postValidateToken = async (chain: string, token: string) => {
  try {
    const response = await fetch(`${API_REPORTS_URL}/device/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization_key: AUTHORIZATION_KEY,
        'auth-token': token,
      },
      body: JSON.stringify({ chain }),
    });

    // Si no hay respuesta válida
    if (!response || typeof response.json !== 'function') {
      console.error('Respuesta inválida o fetch falló');
      return { status: 'error', message: 'Error de red (sin response)' };
    }

    // Si el servidor responde pero con error HTTP (como 503)
    if (!response.ok) {
      return { status: 'error', message: 'Error HTTP', code: response.status };
    }

    let res;
    try {
      res = await response.json();
    } catch (jsonError) {
      console.error('Error al parsear JSON:', jsonError);
      return { status: 'error', message: 'Respuesta no es JSON válida', detail: jsonError };
    }

    if (res.status === 'error') return res;
    return res;
  } catch (error) {
    console.error('Error postValidateToken:', error);
    return { status: 'error', message: 'Error de red', detail: error };
  }
};

export default postValidateToken;
