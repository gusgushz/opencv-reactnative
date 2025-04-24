import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, BackHandler, NativeModules, Platform, Text, TouchableOpacity } from 'react-native';
import { CameraProps } from './NavigationProps';
import { openCamera, closeCamera } from './CameraUtils';

const { OpencvFunc, OpenCVWrapper } = NativeModules;

export const Camera = ({ navigation }: CameraProps) => {
  const [cameraReady, setCameraReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
          console.log(res.split('_'))
          const info = res.split('_');
          await closeCamera(setCameraReady);

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

  return ( 
  <View style={styles.container}>
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
});
