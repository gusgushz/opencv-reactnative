import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, BackHandler, NativeModules } from 'react-native';
import { CameraProps } from './NavigationProps';
import { openCamera, closeCamera } from './CameraUtils';

const { OpencvFunc } = NativeModules;

export const Camera = ({ navigation }: CameraProps) => {
  const [cameraReady, setCameraReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
          const info = res.split('_');
          closeCamera(setCameraReady);

          navigation.navigate('Information', {
            uno: info[0],
            plateType: info[1],
            tres: info[2],
            plateNumberType: info[3],
            plate: info[4],
            whichVehicleNumber: info[5],
            whichVehicleText: info[6],
            state: info[7],
            nueve: info[8],
            companyName: info[9],
            batch: info[10],
            validity: info[11],
            manufactureYear: info[12],
            url: info[13],
          });
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

  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});
