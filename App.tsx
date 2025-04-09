import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, PermissionsAndroid, Platform, SafeAreaView, NativeModules } from 'react-native';
const { OpenCVWrapper } = NativeModules;

import * as Sentry from '@sentry/react-native';
import { RootStackParamList } from './src/NavigationProps';
import { Camera } from './src/CameraScreen';
import { Information } from './src/InformationScreen';
import { Home } from './src/HomeScreen';
Sentry.init({ dsn: 'https://86a8a5548583da54c5af87a58acf940a@o1412274.ingest.us.sentry.io/4508937809362944' });

function App() {
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
  }, []);

  return (
    <SafeAreaView style={styles.ios}>
      <MyStack></MyStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ios: { flex: 1 },
});

export default Sentry.wrap(App);

const Stack = createNativeStackNavigator<RootStackParamList>();

const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={'Home'}>
        <Stack.Screen name="Home" component={Home} options={{ headerShown: true }} />
        <Stack.Screen name="Camera" component={Camera} options={{ headerShown: true }} />
        <Stack.Screen name="Information" component={Information} options={{ headerShown: true, headerTitle: 'Información' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
