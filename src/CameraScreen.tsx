import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, BackHandler, NativeModules, ScrollView, Vibration, TouchableOpacity, Platform } from 'react-native';
import { CameraProps } from './NavigationProps';
import { openCamera, closeCamera } from './CameraUtils';

const { OpencvFunc, OpenCVWrapper } = NativeModules;

export const Camera = ({ navigation }: CameraProps) => {
  const [cameraReady, setCameraReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [i, setI] = useState<string[]>([]);
  const lastScannedRef = useRef<string | null>(null); // Almacena el último QR escaneado

  // Solo para iOS: header personalizado
  useEffect(() => {
    if (Platform.OS === 'ios') {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity style={{ width: 'auto', height: '100%' }} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Home</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation]);

  useEffect(() => {
    const onFocus = () => {
      //setCameraReady(false);

      // Retrasar la apertura de la cámara para que la animación termine
      timerRef.current = setTimeout(async () => {
        await openCamera(setCameraReady);
      }, 500); // Ajusta el tiempo según lo que necesites
    };

    const onBlur = async () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      await closeCamera(setCameraReady);
    };

    const onBeforeRemove = async (e: any) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      await closeCamera(setCameraReady);
      const action = e.data.action;
      if (action.type !== 'GO_BACK') {
        e.preventDefault();
        navigation.dispatch(action);
      }
    };

    const unsubscribeFocus = navigation.addListener('focus', onFocus);
    const unsubscribeBlur = navigation.addListener('blur', onBlur);
    const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', onBeforeRemove);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      closeCamera(setCameraReady);
      navigation.goBack();
      return true;
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      unsubscribeBeforeRemove();
      backHandler.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigation]);

  useEffect(() => {
    const scanQRCode = async () => {
      try {
        let res;
        if(Platform.OS === "ios"){
          res = await OpenCVWrapper.sendDecodedInfoToReact();
          console.log("TRAE algo res?",res);
        } else {
          res = await OpencvFunc.sendDecodedInfoToReact();
        }
        if (res && res.length > 0) {

          setI(prevI => {
            // Si es un código nuevo (diferente al último escaneado)
            if (res !== lastScannedRef.current) {
              Vibration.vibrate(100);
              lastScannedRef.current = res; // Actualiza el último código escaneado
            }
            return res.split('_');

          });
        } else {
          lastScannedRef.current = null; // Resetear si no hay código
        }
      } catch (err) {
        console.error('Error escaneando QR:', err);
      }
    };

    intervalRef.current = setInterval(scanQRCode, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cameraReady]);

  return (
    <View style={styles.container}>
      <View style={styles.void}></View>
      <ScrollView contentContainerStyle={styles.scroll}>{i && i.length > 0 && i.map((data, key) => <Text key={key}>{data}</Text>)}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonText: {
    fontSize: 18,
    color: 'blue',
  },
  void: {
    height: 370,
    width: '100%',
    backgroundColor: 'black',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
