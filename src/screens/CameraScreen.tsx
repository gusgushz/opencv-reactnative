import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, BackHandler, NativeModules, Vibration, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { CameraScreenProps } from '../navigation/NavigationProps';
import { openCamera, closeCamera, clearNativeInfo, nativeInfo } from '../utils/';
import { stylesTemplate } from '../theme';
import { AdvancedCheckbox } from 'react-native-advanced-checkbox';
import { RoleLevels, stateNameToId, region, providerId } from '../globalVariables';
import { Parts, Service } from '../models';
import { getServices } from '../utils/';
import { SECURITY_LEVEL } from 'dotenv';
import { usePreventRemove } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export const CameraScreen = ({ navigation, route }: CameraScreenProps) => {
  const { roleLevel } = route.params;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScannedRef = useRef<string | null>(null); // Almacena el último QR escaneado
  const [checkBoxes, setCheckBoxes] = useState<boolean[]>([false, false, false]);
  const [documents, setDocuments] = useState<string[]>([]); // fuera del useEffect
  const [services, setServices] = useState<Service[]>([]);

  // 👇 Aquí evitas que se elimine la pantalla sin cerrar la cámara primero
  usePreventRemove(true, async ({ data }) => {
    // Cancelar temporizador si existe
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Cerrar cámara
    await clearNativeInfo();
    await closeCamera();
    lastScannedRef.current = null;
    setCheckBoxes([false, false, false]);
    setDocuments([]);

    // Después despachar la acción original
    navigation.dispatch(data.action);
  });

  useEffect(() => {
    const onFocus = () => {
      setCheckBoxes([false, false, false]);
      setDocuments([]);
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
      await clearNativeInfo();
      await closeCamera();
      lastScannedRef.current = null; // Reiniciar el último QR escaneado
    };

    // const onBeforeRemove = async (e: any) => {
    //   if (timerRef.current) {
    //     clearTimeout(timerRef.current);
    //     timerRef.current = null;
    //   }
    //   await clearNativeInfo();
    //   await closeCamera();
    //   setCheckBoxes([false, false, false]);
    //   lastScannedRef.current = null; // Reiniciar el último QR escaneado

    //   const action = e.data.action;
    //   if (action.type !== 'GO_BACK') {
    //     e.preventDefault();
    //     navigation.dispatch(action);
    //   }
    // };

    const unsubscribeFocus = navigation.addListener('focus', onFocus);
    const unsubscribeBlur = navigation.addListener('blur', onBlur);
    // const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', onBeforeRemove);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      // unsubscribeBeforeRemove();
      backHandler.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigation]);

  useEffect(() => {
    const scanQRCode = async () => {
      try {
        const res = await nativeInfo();
        if (res && res.length > 0) {
          // Si es un código nuevo (diferente al último escaneado)
          //NOTE: esto es para que solo funcione el codigo con una región(nombre del estado)
          console.log('providerid', providerId);
          console.log('split10', res.split('_')[10]);
          if (region == res.split('_')[7] && providerId == res.split('_')[10]) {
            console.log('split7', res.split('_')[7]);
            console.log('split1', res.split('_')[1]);
            if (res !== lastScannedRef.current) {
              Vibration.vibrate(100);
              const parts = res.split('_');

              const { serviceName, hasFrontal, hasRear, hasEngomado } = findServiceName(parts[5], parts[7]);
              let newDocuments = [...documents]; // copia el estado actual
              const updatedInfo: Parts = {
                roleLevel,
                version: parts[0],
                codeType: parts[1],
                chainLength: parts[2],
                permissionLevel: parts[3],
                serial: parts[4],
                typeServiceId: parts[5],
                typeServiceText: serviceName,
                state: parts[7],
                batch: parts[8],
                provider: parts[9],
                providerNumber: parts[10],
                expirationDate: parts[11],
                manufacturedYear: parts[12],
                url: parts[13],
                documents: newDocuments,
              };

              console.log('parts:', JSON.stringify(parts));
              console.log('updatedInfo:', JSON.stringify(updatedInfo));
              console.log('rolelevel', roleLevel);
              console.log('enum role', RoleLevels.ZERO);
              if (roleLevel == RoleLevels.ZERO) {
                navigateToInformationScreen(updatedInfo);
              }
              let newCheckBoxes = [...checkBoxes];

              const isSamePlate = res.split('_')[4] === lastScannedRef.current?.split('_')[4];
              console.log('lastScannedRef.current', lastScannedRef.current?.split('_')[4]);
              console.log('res', res.split('_')[4]);
              console.log('isSamePlate', isSamePlate);
              if (!isSamePlate) {
                newCheckBoxes = [false, false, false];
                newDocuments = [];
                setDocuments(newDocuments);
                setCheckBoxes(newCheckBoxes);
              }

              switch (updatedInfo.codeType) {
                case 'Trasero':
                  newCheckBoxes[0] = true;
                  if (!newDocuments.includes('Trasera')) newDocuments.push('Trasera');
                  break;
                case 'Delantero':
                  newCheckBoxes[1] = true;
                  if (!newDocuments.includes('Frontal')) newDocuments.push('Frontal');
                  break;
                case 'Engomado':
                  newCheckBoxes[2] = true;
                  if (!newDocuments.includes('Engomado')) newDocuments.push('Engomado');
                  break;
              }

              console.log('documents', documents);
              setCheckBoxes(newCheckBoxes);
              setDocuments(newDocuments);

              lastScannedRef.current = res; // Actualiza el último código escaneado

              if (
                ((newCheckBoxes[0] && newCheckBoxes[1]) || (newCheckBoxes[0] && newCheckBoxes[2]) || (newCheckBoxes[1] && newCheckBoxes[2])) &&
                SECURITY_LEVEL === 'public'
              )
                navigateToInformationScreen(updatedInfo);

              if (hasRear && hasFrontal && hasEngomado) {
                if (newCheckBoxes[0] && newCheckBoxes[1] && newCheckBoxes[2]) navigateToInformationScreen(updatedInfo);
              }
              if (hasRear && hasFrontal && !hasEngomado) {
                if (newCheckBoxes[0] && newCheckBoxes[1]) navigateToInformationScreen(updatedInfo);
              }
              if (hasFrontal && !hasEngomado && !hasRear) {
                if (newCheckBoxes[1]) navigateToInformationScreen(updatedInfo);
              }
              if (hasRear && !hasFrontal && !hasEngomado) {
                if (newCheckBoxes[0]) navigateToInformationScreen(updatedInfo);
              }
            }
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

  const findServiceName = (typeServiceId: string, state: string) => {
    const stateId = stateNameToId(state);
    const service = services.find(service => {
      return service.service_db_id.toString() === typeServiceId && service.state_id === stateId;
    });
    const serviceName: string = service?.parent_service_name ?? 'No se encontró el servicio';
    const hasFrontal: boolean = service?.has_frontal === 1 ? true : false;
    const hasRear: boolean = service?.has_rear === 1 ? true : false;
    const hasEngomado: boolean = service?.has_engomado === 1 ? true : false;
    return { serviceName, hasFrontal, hasRear, hasEngomado };
  };

  const navigateToInformationScreen = async (parts: Parts) => {
    await closeCamera();
    console.log('Navigating to InformationScreen with parts:', parts);
    navigation.navigate('InformationScreen', {
      roleLevel: roleLevel,
      version: parts.version,
      codeType: parts.codeType,
      chainLength: parts.chainLength,
      permissionLevel: parts.permissionLevel,
      serial: parts.serial,
      typeServiceId: parts.typeServiceId,
      typeServiceText: parts.typeServiceText,
      state: parts.state,
      batch: parts.batch,
      provider: parts.provider,
      providerNumber: parts.providerNumber,
      expirationDate: parts.expirationDate,
      manufacturedYear: parts.manufacturedYear,
      url: parts.url,
      documents: parts.documents,
    });
  };

  const checkboxesData = [
    { id: 1, label: 'Placa trasera identificada', isChecked: checkBoxes[0] },
    { id: 2, label: 'Placa frontal identificada', isChecked: checkBoxes[1] },
    { id: 3, label: 'Engomado identificado', isChecked: checkBoxes[2] },
  ];
  //info[1] = "Delantero"  "Trasero"  "Engomado"

  return (
    <View style={[styles.container, stylesTemplate.screenBgColor]}>
      <View style={styles.void}></View>
      <View style={{ paddingHorizontal: 34, paddingVertical: 68, gap: 10 }}>
        {checkboxesData.map(checkbox => (
          <AdvancedCheckbox
            key={checkbox.id}
            value={checkbox.isChecked}
            label={checkbox.label}
            checkedColor="#8F0F40"
            uncheckedColor="#747272"
            size={24}
            checkBoxStyle={{ borderRadius: 24 }}
            labelStyle={{ color: checkbox.isChecked ? '#8F0F40' : '#747272' }}
            animationType="fade"
          />
        ))}
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
    // backgroundColor: 'red',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
