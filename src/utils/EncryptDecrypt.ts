import CryptoJS from 'react-native-crypto-js';
import SHA256 from 'crypto-js/sha256';

// Codifica una cadena en Base64
export const base64Encode = (data: string): string => {
  const wordArray = CryptoJS.enc.Utf8.parse(data);
  return CryptoJS.enc.Base64.stringify(wordArray);
};

// Decodifica una cadena Base64
export const base64Decode = (data: string): string => {
  const parsedWordArray = CryptoJS.enc.Base64.parse(data);
  return CryptoJS.enc.Utf8.stringify(parsedWordArray);
};

// Encripta una cadena de texto con clave y vector de inicialización
export const encryptString = (plainText: string, key: Uint8Array, iv: Uint8Array): string => {
  const keyNumberArray: number[] = Array.from(key);
  const ivNumberArray: number[] = Array.from(iv);

  const keyWordArray = CryptoJS.lib.WordArray.create(keyNumberArray);
  const ivWordArray = CryptoJS.lib.WordArray.create(ivNumberArray);

  const encrypted = CryptoJS.AES.encrypt(plainText, keyWordArray, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString(); // Base64
};

// Desencripta una cadena de texto encriptada con AES
export const decryptString = (cipherText: string, key: Uint8Array, iv: Uint8Array): string => {
  const keyNumberArray: number[] = Array.from(key);
  const ivNumberArray: number[] = Array.from(iv);

  const keyWordArray = CryptoJS.lib.WordArray.create(keyNumberArray);
  const ivWordArray = CryptoJS.lib.WordArray.create(ivNumberArray);

  const decrypted = CryptoJS.AES.decrypt(cipherText, keyWordArray, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};

// Convierte una cadena en Base64, separada por "@", a un JSON legible
export const readableString = (completeChain: string): string => {
  const decodedChain = base64Decode(completeChain);

  const [jsonString, ivString, keyString] = decodedChain.split('@');

  const keyDecoded = base64Decode(keyString);

  const keyBytes = SHA256(CryptoJS.enc.Utf8.parse(keyDecoded));

  const ivBytes = CryptoJS.enc.Base64.parse(ivString);

  const decrypted = CryptoJS.AES.decrypt(jsonString, keyBytes, {
    iv: ivBytes,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};
