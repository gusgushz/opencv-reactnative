import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, BackHandler, NativeModules, Vibration, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { CameraScreenProps } from '../navigation/NavigationProps';
import { openCamera, closeCamera } from '../utils/';
import { stylesTemplate } from '../theme';
import { AdvancedCheckbox } from 'react-native-advanced-checkbox';
import { RoleLevels, stateNameToId } from '../globalVariables';
import { Parts, Service } from '../models';
import { getServices } from '../utils/';
import AppConfig from '../config/app.json';

const { OpencvFunc, OpenCVWrapper } = NativeModules;
const { height } = Dimensions.get('window');

export const CameraScreen = ({ navigation, route }: CameraScreenProps) => {
  const { roleLevel } = route.params;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScannedRef = useRef<string | null>(null); // Almacena el último QR escaneado
  const [checkBoxes, setCheckBoxes] = useState<boolean[]>([false, false, false]);
  const [services, setServices] = useState<Service[]>([]);

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
            Vibration.vibrate(100);
            const parts = res.split('_');

            const serviceName = findServiceName(parts[5], parts[7]);
            let documents: string[] = [];
            if (hasFrontal) documents.push('Frontal');
            if (hasRear) documents.push('Trasera');
            if (hasEngomado) documents.push('Engomado');
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
              documents: documents,
            };

            console.log('parts:', JSON.stringify(parts));
            console.log('updatedInfo:', JSON.stringify(updatedInfo));

            if (roleLevel === RoleLevels.ZERO) {
              navigateToInformationScreen(updatedInfo);
            }
            let newCheckBoxes = [...checkBoxes];

            const isSamePlate = res.split('_')[4] === lastScannedRef.current?.split('_')[4];
            console.log('lastScannedRef.current', lastScannedRef.current?.split('_')[4]);
            console.log('res', res.split('_')[4]);
            console.log('isSamePlate', isSamePlate);
            if (!isSamePlate) {
              newCheckBoxes = [false, false, false];
              setCheckBoxes(newCheckBoxes);
            }

            switch (updatedInfo.codeType) {
              case 'Trasero':
                newCheckBoxes[0] = true;
                break;
              case 'Delantero':
                newCheckBoxes[1] = true;
                break;
              case 'Engomado':
                newCheckBoxes[2] = true;
                break;
            }
            setCheckBoxes(newCheckBoxes);

            lastScannedRef.current = res; // Actualiza el último código escaneado

            // if (roleLevel === RoleLevels.ONE && newCheckBoxes[1]) {
            //   navigateToInformationScreen(updatedInfo);
            // } else if (roleLevel === RoleLevels.TWO && newCheckBoxes[0] && newCheckBoxes[1]) {
            //   navigateToInformationScreen(updatedInfo);
            // } else if (
            //   roleLevel === RoleLevels.THREE
            //   //&& newCheckBoxes.every(v => v) //FIXME:
            // ) {
            // }
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
    const stateId = stateNameToId(state);
    const service = services.find(service => {
      return service.service_db_id.toString() === typeServiceId && service.state_id === stateId;
    });
    return service?.parent_service_name ?? 'No se encontró el servicio';
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
    backgroundColor: 'black',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
