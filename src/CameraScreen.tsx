import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, BackHandler, NativeModules, ScrollView, Vibration } from 'react-native';
import { CameraProps } from './NavigationProps';
import { openCamera, closeCamera } from './CameraUtils';

const { OpencvFunc } = NativeModules;

export const Camera = ({ navigation }: CameraProps) => {
  const [cameraReady, setCameraReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [i, setI] = useState<string[]>([]);
  const lastScannedRef = useRef<string | null>(null); // Almacena el último QR escaneado

  useEffect(() => {
    const onFocus = () => {
      //setCameraReady(false);

      // Retrasar la apertura de la cámara para que la animación termine
      timerRef.current = setTimeout(() => {
        openCamera(setCameraReady);
      }, 200); // Ajusta el tiempo según lo que necesites
    };

    const onBlur = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      closeCamera(setCameraReady);
    };

    const onBeforeRemove = (e: any) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      closeCamera(setCameraReady);
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
        const res = await OpencvFunc.sendDecodedInfoToReact();
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
