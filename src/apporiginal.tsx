// import React, { useEffect, useState } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import {
//   Text,
//   View,
//   Linking,
//   StyleSheet,
//   PermissionsAndroid,
//   Platform,
//   TouchableOpacity,
//   BackHandler,
//   SafeAreaView,
//   NativeModules,
//   ScrollView,
//   Dimensions,
// } from 'react-native';

// const { OpencvFunc, OpenCVWrapper } = NativeModules;

// import * as Sentry from '@sentry/react-native';
// import { RootStackParamList } from './src/NavigationProps';
// Sentry.init({ dsn: 'https://86a8a5548583da54c5af87a58acf940a@o1412274.ingest.us.sentry.io/4508937809362944' });
// const { height, width } = Dimensions.get('window');
// function App() {
//   const [cameraIDs, setCameraIDs] = useState<string>('');
//   const [plateInfo, setPlateInfo] = useState<string>('');
//   const [QRCodeInfo, setQRCodeInfo] = useState<string>('');
//   const [cameraReady, setCameraReady] = useState<boolean>(false);
//   const [CVversion, setCVversion] = useState<string>('');

//   useEffect(() => {
//     const backAction = () => {
//       if (Platform.OS === 'android') {
//         OpencvFunc.stopCamera();
//       } else {
//         OpenCVWrapper.stopCamera();
//       }
//       setQRCodeInfo('');
//       setPlateInfo('');
//       setCameraReady(false);
//       return true;
//     };
//     const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
//     return () => backHandler.remove();
//   }, []);

//   // Request permissions based on Android version
//   const requestPermissions = async () => {
//     try {
//       if (Platform.OS === 'android') {
//         const cameraPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
//         if (cameraPermission !== PermissionsAndroid.RESULTS.GRANTED) {
//           console.warn('Permiso de cámara denegado en Android');
//           return;
//         }
//       } else {
//         const cameraPermission = await OpenCVWrapper.checkCameraPermission();
//         console.log('Permiso de cámara en iOS:', cameraPermission);
//         if (cameraPermission !== 'granted') {
//           await OpenCVWrapper.requestCameraPermission();
//         }
//       }
//     } catch (err) {
//       console.warn('Error solicitando permisos:', err);
//     }
//   };

//   useEffect(() => {
//     requestPermissions();
//     //openCamera();
//   }, []);

//   const openCamera = async () => {
//     try {
//       if (Platform.OS === 'android') {
//         await OpencvFunc.startCamera();
//       } else {
//         await OpenCVWrapper.startCamera();
//       }
//       setCameraReady(true);
//     } catch (error) {
//       console.error('Error al abrir la cámara:', error);
//       // Sentry.captureException(error, {
//       //   tags: { function: 'openCamera', platform: Platform.OS },
//       //   extra: { cameraReady, errorMessage: error.message, errorStack: error.stack },
//       // });
//     }
//   };
//   const closeCamera = async () => {
//     try {
//       if (Platform.OS === 'android') {
//         await OpencvFunc.stopCamera();
//       } else {
//         await OpenCVWrapper.stopCamera();
//       }
//       setQRCodeInfo('');
//       setPlateInfo('');
//       setCameraReady(false);
//     } catch (error) {
//       console.error('Error al abrir la cámara:', error);
//       // Sentry.captureException(error, {
//       //   tags: { function: 'openCamera', platform: Platform.OS },
//       //   extra: { cameraReady, errorMessage: error.message, errorStack: error.stack },
//       // });
//     }
//   };

//   const getCameraIDs = async () => {
//     try {
//       const cameraIds = await OpenCVWrapper.getCameraIds();
//       console.log('Camera IDs:', cameraIds); // Log the IDs to the console

//       // Display the IDs in the UI (example)
//       setCameraIDs(cameraIds);
//     } catch (error) {
//       console.error('Error getting camera IDs:', error);
//     }
//   };

//   // useEffect(() => {
//   //   console.log('cameraReady cambió:', cameraReady);

//   //   if (!cameraReady) {
//   //     console.log('Esperando a que la cámara esté lista...');
//   //     return;
//   //   }

//   //   const interval = setInterval(async () => {
//   //     try {
//   //       const result = await OpenCVWrapper.sendDecodedInfoToReact();
//   //       console.log('Resultado de sendDecodedInfoToReact:', result);

//   //       if (result && typeof result === 'string' && result.length > 0) {
//   //         setQRCodeInfo(result);
//   //       } else {
//   //         console.log('No se detectó ningún QR');
//   //       }
//   //     } catch (error) {
//   //       console.error('REACT', error);
//   //     }
//   //   }, 1000);

//   //   return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonte
//   // }, [cameraReady]);

//   const get = async () => {
//     try {
//       const version = await OpenCVWrapper.getOpenCVVersion();
//       if (version) {
//         setCVversion(version);
//       }
//     } catch (error) {
//       console.error('REACT', error);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       getQRCodeInfo();
//     }, 500);
//     return () => clearInterval(interval);
//   }, [cameraReady]);

//   const getQRCodeInfo = async () => {
//     try {
//       if (!cameraReady) {
//         console.log('Esperando a que la cámara esté lista...');
//         return;
//       }
//       const result = await OpencvFunc.sendDecodedInfoToReact();
//       if (result && result.length > 0) {
//         setPlateInfo(result);
//         console.log('QR Detectado:', result);
//       }
//     } catch (error) {
//       console.error('REACT', error);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.ios}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <View style={styles.cameraView} />
//         <View style={styles.container}>
//           <TouchableOpacity onPress={openCamera} style={styles.buttonDarkBlue}>
//             <Text style={styles.buttonText}>Abrir camara</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={get} style={styles.buttonLightBlue}>
//             <Text style={styles.buttonText}>ObtenerIDs/OpencvVersion</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={closeCamera} style={styles.buttonDarkBlue}>
//             <Text style={styles.buttonText}>Cerrar camara</Text>
//           </TouchableOpacity>
//         </View>

//         {QRCodeInfo && (
//           <TouchableOpacity
//             onPress={() => {
//               if (QRCodeInfo) {
//                 Linking.openURL(QRCodeInfo);
//               }
//             }}
//             style={styles.buttonLightBlue}>
//             <Text>{QRCodeInfo}</Text>
//           </TouchableOpacity>
//         )}
//         {cameraIDs && <Text>{cameraIDs}</Text>}
//         {CVversion && <Text>{CVversion}</Text>}
//         {plateInfo && <Text>{plateInfo}</Text>}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   ios: { flex: 1 },
//   container: {
//     flex: 1,
//     height: '100%',
//     padding: 30,
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     backgroundColor: 'lightgrey',
//   },
//   cameraView: {
//     height: height * 0.5 + 50,
//     width: '100%',
//     backgroundColor: 'black',
//   },
//   scrollContainer: { flexGrow: 1, backgroundColor: 'lightgrey', alignItems: 'center' },
//   buttonDarkBlue: {
//     width: 250,
//     height: 60,
//     backgroundColor: 'darkblue',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 4,
//     marginBottom: 12,
//   },
//   //empty: { height: 100, width: 'auto', backgroundColor: 'red' },
//   buttonLightBlue: {
//     width: 250,
//     height: 60,
//     backgroundColor: 'pink',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 4,
//     marginBottom: 12,
//   },
//   buttonPink: {
//     width: 250,
//     height: 60,
//     backgroundColor: 'pink',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 4,
//     marginBottom: 12,
//   },
//   buttonText: {
//     textAlign: 'center',
//     fontSize: 15,
//     color: '#fff',
//   },
// });

// export default Sentry.wrap(App);

// const Stack = createNativeStackNavigator<RootStackParamList>();

// const MyStack = () => {

//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName={'Home'}>
//         <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
//         <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} options={{ headerShown: true, headerTitle: '' }} />
//         <Stack.Screen
//           name="Register"
//           component={RegisterScreen}
//           options={{ headerShown: true, headerTitle: 'Crear cuenta', headerTitleStyle: globalStyles.txtB }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };
