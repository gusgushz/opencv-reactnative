import { Platform, NativeModules } from 'react-native';

const { OpencvFunc, OpenCVWrapper } = NativeModules;

export const openCamera = async (setCameraReady?: (ready: boolean) => void) => {
  try {
    if (Platform.OS === 'android') {
      await OpencvFunc.startCamera();
    } else {
      await OpenCVWrapper.startCamera();
    }
    setCameraReady && setCameraReady(true);
  } catch (error) {
    console.error('Error al abrir la cámara:', error);
    throw error;
  }
};

export const closeCamera = async (setCameraReady?: (ready: boolean) => void) => {
  try {
    if (Platform.OS === 'android') {
      await OpencvFunc.stopCamera();
    } else {
      await OpenCVWrapper.stopCamera();
    }
    setCameraReady && setCameraReady(false);
  } catch (error) {
    console.error('Error al cerrar la cámara:', error);
    throw error;
  }
};

