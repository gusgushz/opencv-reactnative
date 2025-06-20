import { RebrandlyLinks } from '../models';
import { BASE_URL_REBRANDLY, DOMAIN_ID_REBRANDLY, API_KEY_REBRANDLY } from 'dotenv';

const getLink = async (shortURL: string) => {
  const slashTag = shortURL.split('.')[1];
  const urlToFetch: string = `${BASE_URL_REBRANDLY}/links?slashtag=${slashTag}&domain[id]=${DOMAIN_ID_REBRANDLY}`;

  try {
    const response = await fetch(urlToFetch, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: API_KEY_REBRANDLY,
      },
    });
    if (response.status !== 200) return 'Hubo un error al obtener la URL';
    const urls: RebrandlyLinks[] = await response.json();
    const url = urls.find(url => url.slashtag === slashTag);
    if (!url) return 'Url no existe';
    return url.destination;
  } catch (error) {
    console.error('Error in getAllLinks:', error);
    return 'Hubo un error al obtener la URL';
  }
};

export default getLink;