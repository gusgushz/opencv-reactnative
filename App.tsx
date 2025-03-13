import { useEffect, useState } from 'react';
import {
  Text,
  View,
  Linking,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  BackHandler,
  SafeAreaView,
  NativeModules,
} from 'react-native';
import * as Sentry from '@sentry/react-native';
const { OpenCVWrapper } = NativeModules;
Sentry.init({ dsn: 'https://86a8a5548583da54c5af87a58acf940a@o1412274.ingest.us.sentry.io/4508937809362944' });

function App() {
  const [cameraIDs, setCameraIDs] = useState<string>();
  const [QRCodeInfo, setQRCodeInfo] = useState<string>('');
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [CVversion, setCVversion] = useState<string>('');

  // When de camera is open, this action allows the user to return to the previous screen without closing the app
  useEffect(() => {
    const backAction = () => {
      OpenCVWrapper.stopCamera();
      setCameraReady(false);
      setQRCodeInfo('');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Request permissions based on Android version
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const cameraPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (cameraPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Permiso de cámara denegado en Android');
          return;
        }
      } else {
        const cameraPermission = await OpenCVWrapper.checkCameraPermission();
        console.log('Permiso de cámara en iOS:', cameraPermission);
        if (cameraPermission !== 'granted') {
          await OpenCVWrapper.requestCameraPermission();
        }
      }
    } catch (err) {
      console.warn('Error solicitando permisos:', err);
    }
  };

  useEffect(() => {
    requestPermissions();
    //openCamera();
  }, []);

  const openCamera = async () => {
    try {
      await OpenCVWrapper.startCamera();
      setCameraReady(true);
    } catch (error) {
      console.error('Error al abrir la cámara:', error);
      Sentry.captureException(error, {
        tags: { function: 'openCamera', platform: Platform.OS },
        extra: { cameraReady, errorMessage: error.message, errorStack: error.stack },
      });
    }
  };
  const closeCamera = async () => {
    try {
      await OpenCVWrapper.stopCamera();
      setCameraReady(true);
    } catch (error) {
      console.error('Error al abrir la cámara:', error);
      Sentry.captureException(error, {
        tags: { function: 'openCamera', platform: Platform.OS },
        extra: { cameraReady, errorMessage: error.message, errorStack: error.stack },
      });
    }
  };

  const getCameraIDs = async () => {
    try {
      const cameraIds = await OpenCVWrapper.getCameraIds();
      console.log('Camera IDs:', cameraIds); // Log the IDs to the console

      // Display the IDs in the UI (example)
      setCameraIDs(cameraIds);
    } catch (error) {
      console.error('Error getting camera IDs:', error);
    }
  };

  useEffect(() => {
    console.log('cameraReady cambió:', cameraReady); // Agrega este log
    const interval = setInterval(() => {
      const getQRCodeInfo = async () => {
        try {
          if (!cameraReady) {
            console.log('Esperando a que la cámara esté lista...');
            return;
          }
          const result = await OpenCVWrapper.sendDecodedInfoToReact();
          console.log('Resultado de sendDecodedInfoToReact:', result); // Agrega este log
          if (result && typeof result === 'string' && result.length > 0) {
            setQRCodeInfo(result.length.toString());
          } else {
            console.log('No se detectó ningún QR');
          }
        } catch (error) {
          console.error('REACT', error);
        }
      };
      getQRCodeInfo();
    }, 1000);
    return () => clearInterval(interval);
  }, [cameraReady]);

  const get = async () => {
    try {
      const version = await OpenCVWrapper.getOpenCVVersion();
      if (version) {
        setCVversion(version);
      }
    } catch (error) {
      console.error('REACT', error);
    }
  };

  return (
    <SafeAreaView style={styles.ios}>
      <View style={styles.container}>
        <TouchableOpacity onPress={openCamera} style={styles.buttonDarkBlue}>
          <Text style={styles.buttonText}>Abrir camara</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={get} style={styles.buttonLightBlue}>
          <Text style={styles.buttonText}>ObtenerIDs/OpencvVersion</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={closeCamera} style={styles.buttonDarkBlue}>
          <Text style={styles.buttonText}>Cerrar camara</Text>
        </TouchableOpacity>
        {QRCodeInfo && (
          <TouchableOpacity
            onPress={() => {
              if (QRCodeInfo) {
                Linking.openURL(QRCodeInfo);
              }
            }}
            style={styles.buttonLightBlue}>
            <Text>{QRCodeInfo}</Text>
          </TouchableOpacity>
        )}
        {cameraIDs && <Text>{cameraIDs}</Text>}
        {CVversion && <Text>{CVversion}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ios: {flex:1},
  container: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'lightgrey',
  },
  ios: { flex: 1 },
  buttonDarkBlue: {
    width: 250,
    height: 60,
    backgroundColor: 'darkblue',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 12,
  },
  empty: { height: 100, width: 'auto', backgroundColor: 'red' },
  buttonLightBlue: {
    width: 250,
    height: 60,
    backgroundColor: 'pink',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 12,
  },
  buttonPink: {
    width: 250,
    height: 60,
    backgroundColor: 'pink',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 12,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#fff',
  },
});

export default Sentry.wrap(App);