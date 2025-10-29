import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, BackHandler, Vibration, Dimensions } from 'react-native';
import { CameraScreenProps } from '../navigation/NavigationProps';
import { openCamera, closeCamera, clearNativeInfo, nativeInfo, getServices } from '../utils/';
import { stylesTemplate } from '../theme';
import { AdvancedCheckbox } from 'react-native-advanced-checkbox';
import { RoleLevels, stateNameToId, region, providerId, regionId, isDemo, regions, provider } from '../globalVariables';
import { Parts, PartsEdomex, Service } from '../models';
import { SECURITY_LEVEL } from 'dotenv';
import { usePreventRemove } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export const CameraScreen = ({ navigation, route }: CameraScreenProps) => {
  const { roleLevel } = route.params;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const [checkBoxes, setCheckBoxes] = useState<boolean[]>([false, false, false]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // 👇 Aquí evitas que se elimine la pantalla sin cerrar la cámara primero: USADO POR IOS
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

    const unsubscribeFocus = navigation.addListener('focus', onFocus);
    const unsubscribeBlur = navigation.addListener('blur', onBlur);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      backHandler.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigation]);

  useEffect(() => {
    const scanQRCode = async () => {
      try {
        const res = await nativeInfo();
        if (res && res.length > 0) {
          if (isDemo) {
            //REFACTOR: PARA EL MODO DEMO
            if (res.includes('_')) {
              const parts = res.split('_');
              parts[6] = findServiceNameDemo(parts[5], parts[7]);
              console.log('newRes:*******', parts.join('_'));
              navigateToInformationScreen({ info: parts.join('_') });
            } else {
              navigateToInformationScreen({ info: res });
            }
          }
          if (res.includes('XD') && regionId == '15') {
            navigateToInformationScreen({ info: res });
          }
          if (res.includes('|') && regionId == '15') {
            const pts = res.split('|');
            const partsEdomex = {
              url: 'https://edomex.gob.mx/',
              folio: pts[0],
              providerName: 'VIFINSA',
              providerId: pts[1],
              batchNumber: pts[2],
              manufacturedYear: pts[3].slice(0, 2),
              holo: pts[5],
              semester: '2',
              expirationDate: '2025',
              serial: 'AAA-000-A',
            };
            navigateToInformationScreen({ partsEdomex: partsEdomex });
          } else {
            //NOTE: esto es para que solo funcione el codigo con una región(nombre del estado) y con un solo proveedor
            console.log('region', region);
            console.log('split7', res.split('_')[7]);
            console.log('providerid', providerId);
            console.log('split10', res.split('_')[10]);
            if (region == res.split('_')[7] && providerId == res.split('_')[10]) {
              //NOTE:La siguiente linea es solo para cliente VFI ya que puede ver todos los codigos asociados al providerId sin importar el estado, mientras que Vifinsa solo puede ver los de yucatana
              // if (providerId == res.split('_')[10]) {
              // Si es un código nuevo (diferente al último escaneado)
              if (res !== lastScannedRef.current) {
                Vibration.vibrate(100);
                const parts = res.split('_');

                const { serviceName, hasFrontal, hasRear, hasEngomado } = findServiceName(parts[5], parts[7]);
                let newDocuments = [...documents]; // copia el estado actual
                const updatedInfo: Parts = {
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
                if (roleLevel == RoleLevels.ZERO) {
                  navigateToInformationScreen({ parts: updatedInfo });
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
                updatedInfo.documents = newDocuments;
                setCheckBoxes(newCheckBoxes);
                setDocuments(newDocuments);

                lastScannedRef.current = res; // Actualiza el último código escaneado

                if (
                  ((newCheckBoxes[0] && newCheckBoxes[1]) || (newCheckBoxes[0] && newCheckBoxes[2]) || (newCheckBoxes[1] && newCheckBoxes[2])) &&
                  SECURITY_LEVEL === 'public'
                )
                  navigateToInformationScreen({ parts: updatedInfo });

                if (hasRear && hasFrontal && hasEngomado) {
                  if (newCheckBoxes[0] && newCheckBoxes[1] && newCheckBoxes[2]) navigateToInformationScreen({ parts: updatedInfo });
                }
                if (hasRear && hasFrontal && !hasEngomado) {
                  if (newCheckBoxes[0] && newCheckBoxes[1]) navigateToInformationScreen({ parts: updatedInfo });
                }
                if (hasFrontal && !hasEngomado && !hasRear) {
                  if (newCheckBoxes[1]) navigateToInformationScreen({ parts: updatedInfo });
                }
                if (hasRear && !hasFrontal && !hasEngomado) {
                  if (newCheckBoxes[0]) navigateToInformationScreen({ parts: updatedInfo });
                }
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
  const findServiceNameDemo = (typeServiceId: string, state: string) => {
    const stateId = regions.findIndex(r => r === state);
    const service = services.find(service => {
      return service.service_db_id.toString() == typeServiceId && service.state_id == stateId;
    });
    const serviceName: string = service?.parent_service_name ?? 'No se encontró el servicio';
    return serviceName;
  };

  type NavigateParams = { parts: Parts } | { partsEdomex: PartsEdomex } | { info: string };
  const navigateToInformationScreen = async (params: NavigateParams) => {
    await closeCamera();
    console.log('Navigating to InformationScreen with parts:', params);
    if ('info' in params) navigation.navigate('InformationScreen', { roleLevel, info: params.info });
    if ('partsEdomex' in params)
      navigation.navigate('InformationScreen', {
        roleLevel,
        url: params.partsEdomex.url,
        folio: params.partsEdomex.folio,
        providerName: params.partsEdomex.providerName,
        providerId: params.partsEdomex.providerId,
        batchNumber: params.partsEdomex.batchNumber,
        manufacturedYear: params.partsEdomex.manufacturedYear,
        holo: params.partsEdomex.holo,
        semester: params.partsEdomex.semester,
        expirationDate: params.partsEdomex.expirationDate,
        serial: params.partsEdomex.serial,
      });
    if ('parts' in params)
      navigation.navigate('InformationScreen', {
        roleLevel,
        version: params.parts.version,
        codeType: params.parts.codeType,
        chainLength: params.parts.chainLength,
        permissionLevel: params.parts.permissionLevel,
        serial: params.parts.serial,
        typeServiceId: params.parts.typeServiceId,
        typeServiceText: params.parts.typeServiceText,
        state: params.parts.state,
        batch: params.parts.batch,
        provider: params.parts.provider,
        providerNumber: params.parts.providerNumber,
        expirationDate: params.parts.expirationDate,
        manufacturedYear: params.parts.manufacturedYear,
        url: params.parts.url,
        documents: params.parts.documents,
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
            checkedColor={provider == 'vfi' ? '#006F45' : stylesTemplate.primaryColor.backgroundColor}
            uncheckedColor="#747272"
            size={24}
            checkBoxStyle={{ borderRadius: 24 }}
            labelStyle={{
              color: !checkbox.isChecked ? '#747272' : provider == 'vfi' ? '#006F45' : stylesTemplate.primaryColor.backgroundColor,
            }}
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
