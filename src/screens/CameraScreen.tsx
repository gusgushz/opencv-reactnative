import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, BackHandler, NativeModules, Vibration, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { CameraScreenProps } from '../navigation/NavigationProps';
import { openCamera, closeCamera } from '../utils/';
import { stylesTemplate } from '../theme';
import { AdvancedCheckbox } from 'react-native-advanced-checkbox';
import { stateNameToId } from '../globalVariables';
import { Parts, Service } from '../models';
import { getServices } from '../utils/';
import { useScanContext } from '../contexts/ScanContext';

const { OpencvFunc, OpenCVWrapper } = NativeModules;
const { height } = Dimensions.get('window');

export const CameraScreen = ({ navigation, route }: CameraScreenProps) => {
  const { roleLevel } = route.params;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScannedRef = useRef<string | null>(null); // Almacena el último QR escaneado
  const [checkBoxes, setCheckBoxes] = useState<boolean[]>([false, false, false]);
  const [services, setServices] = useState<Service[]>([]);
  const { setParts, setPartsEdomex, parts, partsEdomex } = useScanContext();

  // Solo para iOS: header personalizado por tema de la animación de la pantalla
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
      setCheckBoxes([false, false, false]);
      setServices(getServices() ?? []);
      // Retrasar la apertura de la cámara para que la animación termine
      timerRef.current = setTimeout(async () => {
        await openCamera();
      }, 500); // Ajusta el tiempo según lo que necesites
    };

    const onBlur = async () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      await closeCamera();
      lastScannedRef.current = null; // Reiniciar el último QR escaneado
    };

    const onBeforeRemove = async (e: any) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      await closeCamera();
      setCheckBoxes([false, false, false]);
      lastScannedRef.current = null; // Reiniciar el último QR escaneado

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

  const hasRear: boolean = !!services.find(service => service.has_rear === 1);
  console.log('hasRear', hasRear);
  const hasFrontal: boolean = !!services.find(service => service.has_frontal === 1);
  console.log('hasFrontal', hasFrontal);
  const hasEngomado: boolean = !!services.find(service => service.has_engomado === 1);
  console.log('hasEngomado', hasEngomado);

  useEffect(() => {
    const scanQRCode = async () => {
      try {
        let res;
        if (Platform.OS === 'ios') {
          res = await OpenCVWrapper.sendDecodedInfoToReact();
          console.log('TRAE algo res?', res);
        } else {
          res = await OpencvFunc.sendDecodedInfoToReact();
        }
        if (res && res.length > 0) {
          // Si es un código nuevo (diferente al último escaneado)
          if (res !== lastScannedRef.current) {
            let pts;
            if (res.includes('XD')) {
              Vibration.vibrate(100);
              navigateToInformationScreen(res);
            }
            if (res.includes('|')) {
              Vibration.vibrate(100);

              pts = res.split('|');
              //NOTE:Informacion hardcodeada para Edomex
              setPartsEdomex({
                url: 'https://edomex.gob.mx/',
                folio: pts[0],
                providerName: 'VIFINSA',
                providerId: pts[1],
                batchNumber: pts[2],
                manufacturedYear: pts[3].slice(0, 2),
                holo: '00',
                semester: '2',
                expirationDate: '2025',
                serial: 'AAA-000-A',
              });
              console.log('parts*************:', JSON.stringify(pts));
              lastScannedRef.current = res; // Actualiza el último código escaneado
              navigateToInformationScreen();
            }
            //TODO: Oculto ya que esta rama (EDOMEX) no necesita escanera placas
            // else {
            //   pts = res.split('_');
            //   const serviceName = findServiceName(pts[5], pts[7]);
            //   let documents: string[] = [];
            //   if (hasFrontal) documents.push('Frontal');
            //   if (hasRear) documents.push('Trasera');
            //   if (hasEngomado) documents.push('Engomado');
            //   const updatedInfo: Parts = {
            //     version: pts[0],
            //     codeType: pts[1],
            //     chainLength: pts[2],
            //     permissionLevel: pts[3],
            //     serial: pts[4],
            //     typeServiceId: pts[5],
            //     typeServiceText: serviceName,
            //     state: pts[7],
            //     batch: pts[8],
            //     provider: pts[9],
            //     providerNumber: pts[10],
            //     expirationDate: pts[11],
            //     manufacturedYear: pts[12],
            //     url: pts[13],
            //     documents: documents,
            //   };
            //   setParts(updatedInfo);
            //   console.log('parts:', JSON.stringify(pts));
            //   console.log('updatedInfo:', JSON.stringify(updatedInfo));
            // }
          }
        }
      } catch (err) {
        console.error('Error escaneando QR:', err);
      }
    };

    intervalRef.current = setInterval(scanQRCode, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkBoxes]);

  const findServiceName = (typeServiceId: string, state: string): string => {
    console.log('stateNAME', state);
    const stateId = stateNameToId(state);
    console.log('stateId', stateId);
    const service = services.find(service => {
      return service.service_db_id.toString() === typeServiceId && service.state_id === stateId;
    });
    return service?.parent_service_name ?? 'No se encontró el servicio';
  };

  const navigateToInformationScreen = async (info?: string) => {
    await closeCamera();
    navigation.navigate('InformationScreen', { roleLevel: roleLevel, info: info ?? '' });
  };

  const checkboxesData = [
    { id: 1, label: 'Placa trasera identificada', isChecked: checkBoxes[0] },
    { id: 2, label: 'Placa frontal identificada', isChecked: checkBoxes[1] },
    { id: 3, label: 'Engomado identificado', isChecked: checkBoxes[2] },
  ];

  return (
    <View style={[styles.container, stylesTemplate.screenBgColor]}>
      <View style={styles.void}></View>
      <View style={{ paddingHorizontal: 34, paddingVertical: 68, gap: 10 }}>
        <AdvancedCheckbox label={'Escanear código'} checkedColor="#8F0F40" uncheckedColor="#747272" size={24}></AdvancedCheckbox>
      </View>
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
    height: height / 2,
    width: '100%',
    backgroundColor: 'black',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
