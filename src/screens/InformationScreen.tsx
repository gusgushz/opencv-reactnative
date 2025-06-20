import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import { InformationScreenProps } from '../navigation/NavigationProps';
import { stylesTemplate } from '../theme';
import { RoleLevels } from '../globalVariables';
import { Parts } from '../models';
import { getLink } from '../api';

export const InformationScreen = ({ route, navigation }: InformationScreenProps) => {
  const {
    roleLevel,
    version,
    codeType,
    chainLength,
    permissionLevel,
    serial,
    typeServiceId,
    typeServiceText,
    state,
    batch,
    provider,
    providerNumber,
    expirationDate,
    manufacturedYear,
    url,
  } = route.params;

  const [link, setLink] = useState<string>('Cargando url...');

  useEffect(() => {
    const fetchLink = async () => {
      try {
        setLink(await getLink(url));
      } catch (error) {
        setLink('Error al cargar la URL');
      }
    };
    fetchLink();
  }, []);

  return (
    <View style={[styles.container, stylesTemplate.screenBgColor]}>
      <TouchableOpacity
        style={[styles.containerWithColor, stylesTemplate.primaryColor]}
        onPress={() => {
          if (!link) return;
          Linking.openURL(link);
        }}>
        <Image source={require('../../assets/icons/link.png')} style={{ width: 24, height: 12 }}></Image>
        <Text style={[styles.textNormal, { color: 'white' }]}>URL: {link}</Text>
      </TouchableOpacity>

      {roleLevel == RoleLevels.ONE && (
        <BodyLevelOfClearanceA codeType={codeType} expirationDate={expirationDate} serial={serial} state={state} typeServiceText={typeServiceText} />
      )}

      {roleLevel == RoleLevels.TWO && (
        <>
          <BodyLevelOfClearanceA
            expirationDate={expirationDate}
            serial={serial}
            state={state}
            typeServiceText={typeServiceText}
            codeType={codeType}
          />
          <BodyLevelOfClearanceB
            manufacturedYear={manufacturedYear}
            provider={provider}
            providerNumber={providerNumber}
            batch={batch}
            typeServiceId={typeServiceId}
          />
        </>
      )}

      {roleLevel == RoleLevels.THREE && (
        <>
          <BodyLevelOfClearanceA
            expirationDate={expirationDate}
            serial={serial}
            state={state}
            typeServiceText={typeServiceText}
            //codeType={codeType} //FIXME: ocultar
          />
          <BodyLevelOfClearanceB
            manufacturedYear={manufacturedYear}
            provider={provider}
            providerNumber={providerNumber}
            batch={batch}
            typeServiceId={typeServiceId}
          />
          <TouchableOpacity
            style={[styles.containerWithColor, stylesTemplate.primaryColor]}
            onPress={() => {
              navigation.navigate('InfractionsScreen');
            }}>
            <Text style={[styles.textNormal, { color: 'white', flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>Infracciones</Text>
          </TouchableOpacity>
          {/* <Text style={styles.textNormal}>version: {version}</Text>
          <Text style={styles.textNormal}>Tamaño de la cadena: {chainLength}</Text>
          <Text style={styles.textNormal}>Nivel de permiso: {permissionLevel}</Text> */}
        </>
      )}
    </View>
  );
};

type BodyLevelOfClearanceAProps = Pick<Parts, 'expirationDate' | 'typeServiceText' | 'serial' | 'state'> & {
  codeType?: string;
};

const BodyLevelOfClearanceA: React.FC<BodyLevelOfClearanceAProps> = ({ expirationDate, typeServiceText, serial, state, codeType }) => {
  return (
    <View style={styles.body}>
      <View style={[styles.containerWithColor, stylesTemplate.primaryColor]}>
        <Image source={require('../../assets/icons/person_outline.png')} style={{ width: 24, height: 24 }}></Image>
        <Text style={styles.textHeader}>Perfil privado 2</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.textNormal}>Vigencia: {expirationDate}</Text>
        <Text style={styles.textNormal}>Texto del servicio: {typeServiceText}</Text>
        <Text style={styles.textNormal}>Placa: {serial}</Text>
        <Text style={styles.textNormal}>Estado: {state}</Text>
        {codeType && <Text style={styles.textNormal}>Tipo de Placa: {codeType}</Text>}
      </View>
    </View>
  );
};

type BodyLevelOfClearanceBProps = Pick<Parts, 'provider' | 'providerNumber' | 'batch' | 'manufacturedYear' | 'typeServiceId'>;

const BodyLevelOfClearanceB: React.FC<BodyLevelOfClearanceBProps> = ({ provider, providerNumber, batch, typeServiceId, manufacturedYear }) => {
  return (
    <View style={styles.body}>
      <View style={[styles.containerWithColor, stylesTemplate.primaryColor]}>
        <Image source={require('../../assets/icons/person_outline.png')} style={{ width: 24, height: 24 }}></Image>
        <Text style={styles.textHeader}>Perfil privado 3</Text>
      </View>
      <View style={styles.content}>
        {/* <Text style={styles.textNormal}>Estado: {state}</Text> FIXME: En el original aqui está el estado*/}
        <Text style={styles.textNormal}>Proveedor: {provider}</Text>
        <Text style={styles.textNormal}>Numero proveedor: {providerNumber}</Text>
        <Text style={styles.textNormal}>Lote: {batch}</Text>
        <Text style={styles.textNormal}>Año de Fabricación: {manufacturedYear}</Text>
        <Text style={styles.textNormal}>Número de servicio: {typeServiceId}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  containerWithColor: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    paddingHorizontal: 32,
    paddingVertical: 12,
    alignItems: 'center',
  },
  body: {
    width: '100%',
    backgroundColor: 'white',
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 4,
    //boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.25) ', //TODO:
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
  textNormal: {
    fontSize: 14,
    color: 'black',
  },
  textHeader: {
    verticalAlign: 'middle',
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
});
