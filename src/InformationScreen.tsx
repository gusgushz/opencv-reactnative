import React, { useEffect } from 'react';
import { StyleSheet, View, Text, BackHandler } from 'react-native';
import { InformationProps } from './NavigationProps';

export const Information = ({ route, navigation }: InformationProps) => {
  const {
    companyName,
    manufactureYear,
    nueve,
    plate,
    plateNumberType,
    plateType,
    state,
    tres,
    uno,
    url,
    validity,
    whichVehicleNumber,
    whichVehicleText,
    batch,
  } = route.params;

  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
  //     navigation.goBack();
  //     return true;
  //   });
  //   backHandler.remove();
  // }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.textNormal}>Dato: {uno}</Text>
      <Text style={styles.textNormal}>Tipo de Placa: {plateType}</Text>
      <Text style={styles.textNormal}>Numero del tipo de placa: {plateNumberType}</Text>
      <Text style={styles.textNormal}>Placa: {plate}</Text>
      <Text style={styles.textNormal}>Estado: {state}</Text>
      <Text style={styles.textNormal}>Proveedor: {companyName}</Text>
      <Text style={styles.textNormal}>Tipo de Proveedor: {nueve}</Text>
      <Text style={styles.textNormal}>Año de Fabricación: {manufactureYear}</Text>
      <Text style={styles.textNormal}>Vigencia: {validity}</Text>
      <Text style={styles.textNormal}>URL: {url}</Text>
      <Text style={styles.textNormal}>Número de Vehículo: {whichVehicleNumber}</Text>
      <Text style={styles.textNormal}>Texto del Vehículo: {whichVehicleText}</Text>
      <Text style={styles.textNormal}>Dato: {tres}</Text>
      <Text style={styles.textNormal}>Lote: {batch}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
  textNormal: {
    fontSize: 14,
    color: 'black',
  },
});
