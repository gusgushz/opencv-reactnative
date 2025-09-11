import { Platform, NativeModules } from 'react-native';

const { OpencvFunc, OpenCVWrapper } = NativeModules;

export const openCamera = async () => {
  try {
    if (Platform.OS === 'android') {
      await OpencvFunc.startCamera();
    } else {
      await OpenCVWrapper.startCamera();
    }
  } catch (error) {
    console.error('Error al abrir la cámara:', error);
    throw error;
  }
};

export const closeCamera = async () => {
  try {
    if (Platform.OS === 'android') {
      await OpencvFunc.stopCamera();
    } else {
      await OpenCVWrapper.stopCamera();
    }
  } catch (error) {
    console.error('Error al cerrar la cámara:', error);
    throw error;
  }
};

export const clearNativeInfo = async () => {
  try {
    if (Platform.OS === 'android') {
      await OpencvFunc.clearDecodedInfo();
    } else {
      await OpenCVWrapper.clearDecodedInfo();
    }
  } catch (error) {
    console.error('Error al cerrar la cámara:', error);
    throw error;
  }
};

export const nativeInfo = async () => {
  let info;
  try {
    if (Platform.OS === 'android') {
      info = await OpencvFunc.sendDecodedInfoToReact();
    } else {
      info = await OpenCVWrapper.sendDecodedInfoToReact();
    }
    return info;
  } catch (error) {
    console.error('Error al cerrar la cámara:', error);
    throw error;
  }
};

export const getDeviceId = async () => {
  let id;
  try {
    if (Platform.OS === 'android') {
      id = await OpencvFunc.getAndroidId();
    } else {
      id = await OpenCVWrapper.getIosId();
    }
    return id;
  } catch (error) {
    console.error('No se pudo obtener el ID:', error);
    throw error;
  }
};

export const closeAppWithMessage = async (message: string) => {
  try {
    if (Platform.OS === 'android') {
      await OpencvFunc.exitAppWithMessage(message);
    } else {
      await OpenCVWrapper.exitAppWithMessage(message);
    }
  } catch (error) {
    console.error('No se pudo cerrar la app', error);
    throw error;
  }
};
