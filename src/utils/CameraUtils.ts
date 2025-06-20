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
