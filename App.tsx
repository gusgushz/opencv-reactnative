import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, PermissionsAndroid, Platform, SafeAreaView, NativeModules, StatusBar } from 'react-native';
const { OpenCVWrapper, OpencvFunc } = NativeModules;
import BootSplash from 'react-native-bootsplash';
import { RootStackParamList } from './src/navigation/NavigationProps';
import {
  CameraScreen,
  HomeScreen,
  InformationScreen,
  ProfileScreen,
  LoginScreen,
  InfractionsScreen,
  DownloadSecretKeyScreen,
  AndroidIdScreen,
} from './src/screens/';
import {
  storeServices,
  storeUsersData,
  readableString,
  getKey,
  getToken,
  base64Decode,
  base64Encode,
  storeToken,
  getServices,
  getUsersData,
  removeToken,
  getLastValidateTokenDate,
  storeLastValidateTokenDate,
} from './src/utils';
import ConfigApp from './src/config/app.json';
import { SECURITY_LEVEL } from 'dotenv';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { UpdateByTimestampData } from './src/models';
import {
  getChildServicesByState,
  getRecoverToken,
  getUpdateByTimestamp,
  postKeyActivation,
  postValidateToken,
  postAuthenticateDevice,
  postAuthenticateValidDevice,
} from './src/api';
// import { UserProvider } from './src/contexts/UserContext.tsx';
import { sufix } from './src/globalVariables';
import * as Sentry from '@sentry/react-native';
Sentry.init({ dsn: 'https://86a8a5548583da54c5af87a58acf940a@o1412274.ingest.us.sentry.io/4508937809362944' });

function App() {
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const cameraPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        const readFilePermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        const writeFilePermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);

        if (
          cameraPermission !== PermissionsAndroid.RESULTS.GRANTED &&
          readFilePermission !== PermissionsAndroid.RESULTS.GRANTED &&
          writeFilePermission !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.warn(
            'Permiso de cámara denegado en Android o Permiso de cámara o lectura de archivos denegado en Android o Permiso de cámara o lectura de archivos denegado en Android',
          );
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

  const init = async () => {
    let isPermissionGranted = false;

    const serv = getServices();
    if (!serv) {
      const services = await getChildServicesByState();
      if (services.status !== 'error') storeServices(services.data);
    }

    console.log('SECURITY_LEVEL actual:', SECURITY_LEVEL);

    if (SECURITY_LEVEL === 'private') {
      const exists = await RNFS.exists(`${RNFS.ExternalDirectoryPath}/secretKey.dat`);
      console.log('exists', exists);
      //removeToken();
      if (exists) {
        const androidId = (await OpencvFunc.getAndroidId()) + sufix;
        const token = getToken() ?? '';
        const content = await RNFS.readFile(`${RNFS.ExternalDirectoryPath}/secretKey.dat`, 'utf8');
        const keyDecoded = base64Decode(content);
        const key = getKey() ?? '';
        const chain = base64Encode(key + '.' + androidId);
        const today = new Date();

        console.log('androidId', androidId);
        console.log('token', token);
        console.log('content', content);
        console.log('keyDecoded', keyDecoded);
        console.log('chain', chain);
        if (token != '') {
          if (key === keyDecoded) {
            console.log(key === keyDecoded);
            const dateRaw = getLastValidateTokenDate();
            const date = dateRaw ? new Date(dateRaw) : null;
            // const response = await postValidateToken(chain, token);ºº
            const response = await postAuthenticateValidDevice(androidId, key);
            console.log('response postAuthenticateValidDevice', response);
            if (response.status === 'error' && response.message === 'Error de red') {
              if (date) {
                console.log('getLastValidateTokenDate', date.toLocaleDateString());
                const daysDifference = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
                if (daysDifference <= 7) {
                  console.log('diferencia de días', daysDifference);
                  isPermissionGranted = true;
                  return;
                }
              }
              await OpencvFunc.exitAppWithMessage('Necesita conectarse a internet para validar su sesión. Cerrando la aplicación...');
              return;
            }
            if (response.success === true) {
              storeLastValidateTokenDate(today);
              isPermissionGranted = true;
              return;
            }
          }
        } else {
          console.log('No hay token, se procede a registrar la clave');
          let isKeyRegistered: boolean = false;
          let isKeyAlreadyRegistered: boolean = false;
          const response = await postKeyActivation(androidId, keyDecoded);
          console.log('response postKeyActivation', response);
          if (response.status === 'error') {
            if (response.data == 'key is already active') isKeyAlreadyRegistered = true;
          }
          if (response.status === 'success') isKeyRegistered = true;
          if (isKeyAlreadyRegistered) {
            // console.log('isKeyAlreadyRegistered****', chain);
            // const res = await getRecoverToken(chain);
            // console.log('res isKeyAlreadyRegistered', res);
            // if (res.status === 'success') {
            //   storeLastValidateTokenDate(today);
            //   storeToken(res.authToken);
            //   isPermissionGranted = true;
            //   return;
            // }
            console.log('isKeyAlreadyRegistered**FALTA EL ENDPOINT PARA RECUPERARTOKEN', isKeyAlreadyRegistered);
            storeLastValidateTokenDate(today);
            storeToken('token recuperado');
            isPermissionGranted = true; //FIXME: se dejo en true para pruebas
            return;
          }
          if (isKeyRegistered) {
            const res = await postAuthenticateDevice(chain);
            console.log('res isKeyRegistered****', res);
            if (res.status === 'success') {
              storeLastValidateTokenDate(today);
              storeToken(res.authToken);
              isPermissionGranted = true;
              return;
            }
          }
        }
      } else {
        isPermissionGranted = true;
        return;
      }
      console.log('isPermissionGranted', isPermissionGranted);
      if (!isPermissionGranted) await OpencvFunc.exitAppWithMessage('Permisos denegados. Cerrando la aplicación...');
    } else {
      const res = getUsersData();
      //NOTE: Pruebas para ver los usuario y contraseñas
      // console.log('res', res?.created.length);
      // res?.created.map(user => {
      //   console.log('user', user);
      //   console.log('password decrypted', readableString(user.password));
      // });
      const response = await getUpdateByTimestamp(ConfigApp.Client.Id);
      if (response.status !== 'error') storeUsersData(JSON.parse(readableString(response.data)) as UpdateByTimestampData);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await requestPermissions();
      await init();
      await BootSplash.hide({ fade: true });
      console.log('BootSplash has been hidden successfully');
    };

    initializeApp();
  }, []);

  return (
    <>
      <StatusBar hidden />
      <SafeAreaView style={styles.ios}>
        <MyStack></MyStack>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({ ios: { flex: 1 } });

export default Sentry.wrap(App);

const Stack = createNativeStackNavigator<RootStackParamList>();

const MyStack = () => {
  let exists = false;
  const key = getKey() ?? '';
  if (key !== '') exists = true;
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={SECURITY_LEVEL === 'private' && !exists ? 'DownloadSecretKeyScreen' : 'HomeScreen'}
        screenOptions={{ headerTitleAlign: 'center', headerTintColor: '#737373', headerBackButtonDisplayMode: 'minimal'}}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CameraScreen" component={CameraScreen} options={{ headerShown: true, headerTitle: 'Escanear código',headerBackButtonMenuEnabled: false }} />
        <Stack.Screen name="InformationScreen" component={InformationScreen} options={{ headerShown: true, headerTitle: 'Información' }} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: true, headerTitle: 'Perfil' }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: true, headerTitle: 'Iniciar sesión' }} />
        <Stack.Screen name="InfractionsScreen" component={InfractionsScreen} options={{ headerShown: true, headerTitle: 'Infracciones' }} />
        <Stack.Screen
          name="DownloadSecretKeyScreen"
          component={DownloadSecretKeyScreen}
          options={{ headerShown: false, headerTitle: 'Infracciones' }}
        />
        <Stack.Screen name="AndroidIdScreen" component={AndroidIdScreen} options={{ headerShown: true, headerTitle: 'Soporte técnico' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
