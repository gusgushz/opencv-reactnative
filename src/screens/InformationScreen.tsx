import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import { InformationScreenProps } from '../navigation/NavigationProps';
import { stylesTemplate } from '../theme';
import { Parts, PartsEdomex } from '../models';
import { getLink } from '../api';
import { useScanContext } from '../contexts/ScanContext';
import { useFocusEffect } from '@react-navigation/native';

export const InformationScreen = ({ route, navigation }: InformationScreenProps) => {
  const { roleLevel, info } = route.params;
  const { parts, setParts, partsEdomex, setPartsEdomex } = useScanContext();
  const [visibilityLevels, setVisibilityLevels] = useState<boolean[]>([false, false, false]);

  const [link, setLink] = useState<string>('Cargando url...');
  const fetchLink = async (url: string) => {
    try {
      setLink(await getLink(url));
    } catch (error) {
      setLink('Error al cargar la URL');
    }
  };

  useEffect(() => {
    if (parts) {
      fetchLink(parts.url);
    } else if (partsEdomex) {
      setLink(partsEdomex.url);
    } else if (info) {
      setLink('https://edomex.gob.mx');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      return () => {
        // Do something when the screen is unfocused. Useful for cleanup functions
        setParts(null);
        setPartsEdomex(null);
        setLink('Cargando url...');
        setVisibilityLevels([false, false, false]);
      };
    }, []),
  );

  useEffect(() => {
    const handleVisibilityLevels = (roleLevel: string) => {
      if (roleLevel == '2') return setVisibilityLevels([true, false, false]);
      if (roleLevel == '3') return setVisibilityLevels([true, true, false]);
      if (roleLevel == '4') return setVisibilityLevels([true, true, true]);
    };
    console.log('roleLevel:', roleLevel);
    handleVisibilityLevels(roleLevel);
  }, [roleLevel]);

  return (
    <View style={[styles.container, stylesTemplate.screenBgColor]}>
      <TouchableOpacity
        style={[styles.containerWithColor, stylesTemplate.primaryColor, styles.bottomRadius]}
        onPress={() => {
          if (!link) return;
          Linking.openURL(link);
        }}>
        <Image resizeMode="contain" source={require('../../assets/icons/link.png')} style={{ width: 16, tintColor: 'white' }}></Image>
        <Text style={[styles.textNormal, { color: 'white' }]}>{link}</Text>
      </TouchableOpacity>
      <>
        {visibilityLevels[0] && <BodyLevelOfClearanceA parts={parts} partsEdomex={partsEdomex} info={info} />}
        {visibilityLevels[1] && <BodyLevelOfClearanceB parts={parts} partsEdomex={partsEdomex} info={info} />}
        {visibilityLevels[2] && <BodyLevelOfClearanceC parts={parts} partsEdomex={partsEdomex} navigation={navigation} info={info} />}
      </>
    </View>
  );
};

type BodyLevelOfClearanceProps = {
  parts: Parts | null;
  partsEdomex: PartsEdomex | null;
  navigation?: InformationScreenProps['navigation'];
  info?: string;
};

const BodyLevelOfClearanceA: React.FC<BodyLevelOfClearanceProps> = ({ parts, partsEdomex, info }) => {
  if (parts) {
    return (
      <View style={styles.body}>
        <View style={[styles.containerWithColor, stylesTemplate.primaryColor]}>
          <Image resizeMode="contain" source={require('../../assets/icons/person_outline.png')} style={{ width: 16, tintColor: 'white' }}></Image>
          <Text style={styles.textHeader}>Perfil privado 2</Text>
        </View>
        <View style={styles.content}>
          <View style={{ gap: 4 }}>
            <Text style={styles.textNormal}>Vigencia:</Text>
            <Text style={styles.textNormal}>Servicio:</Text>
            <Text style={styles.textNormal}>Serie:</Text>
            <Text style={styles.textNormal}>Región:</Text>
            <Text style={styles.textNormal}>Documentos:</Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ textAlign: 'right' }}>{parts.expirationDate}</Text>
            <Text style={{ textAlign: 'right' }}>{parts.typeServiceText}</Text>
            <Text style={{ textAlign: 'right' }}>{parts.serial}</Text>
            <Text style={{ textAlign: 'right' }}>{parts.state}</Text>
            <Text style={{ textAlign: 'right' }}>{parts.documents.join(', ')}</Text>
          </View>
        </View>
      </View>
    );
  } else if (partsEdomex) {
    return (
      <View style={styles.body}>
        <View style={[styles.containerWithColor, stylesTemplate.primaryColor]}>
          <Image resizeMode="contain" source={require('../../assets/icons/person_outline.png')} style={{ width: 16, tintColor: 'white' }}></Image>
          <Text style={styles.textHeader}>Perfil privado 2</Text>
        </View>
        <View style={styles.content}>
          <View style={{ gap: 4 }}>
            <Text style={styles.textNormal}>Folio</Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ textAlign: 'right' }}>{partsEdomex.folio}</Text>
          </View>
        </View>
      </View>
    );
  } else if (info) {
    return (
      <View style={styles.body}>
        <View style={[styles.containerWithColor, stylesTemplate.primaryColor]}>
          <Image resizeMode="contain" source={require('../../assets/icons/person_outline.png')} style={{ width: 16, tintColor: 'white' }}></Image>
          <Text style={styles.textHeader}>Perfil privado 2</Text>
        </View>
        <View style={styles.content}>
          <View style={{ gap: 4 }}>
            <Text style={styles.textNormal}>Folio</Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ textAlign: 'right' }}>A20425223</Text>
          </View>
        </View>
      </View>
    );
  }
};

const BodyLevelOfClearanceB: React.FC<BodyLevelOfClearanceProps> = ({ parts, partsEdomex, info }) => {
  if (parts) {
    return (
      <View style={styles.body}>
        <View style={[styles.containerWithColor, stylesTemplate.primaryColor]}>
          <Image resizeMode="contain" source={require('../../assets/icons/person_outline.png')} style={{ width: 16, tintColor: 'white' }}></Image>
          <Text style={styles.textHeader}>Perfil privado 3</Text>
        </View>
        <View style={styles.content}>
          <View style={{ gap: 4 }}>
            <Text style={styles.textNormal}>Nombre del proveedor:</Text>
            <Text style={styles.textNormal}>Número del proveedor:</Text>
            <Text style={styles.textNormal}>Lote:</Text>
            <Text style={styles.textNormal}>Fecha de manufactura:</Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ textAlign: 'right' }}>{parts.provider}</Text>
            <Text style={{ textAlign: 'right' }}>{parts.providerNumber}</Text>
            <Text style={{ textAlign: 'right' }}>{parts.batch}</Text>
            <Text style={{ textAlign: 'right' }}>{parts.manufacturedYear}</Text>
          </View>
        </View>
      </View>
    );
  } else if (partsEdomex) {
    return (
      <View style={styles.body}>
        <View style={[styles.containerWithColor, stylesTemplate.primaryColor]}>
          <Image resizeMode="contain" source={require('../../assets/icons/person_outline.png')} style={{ width: 16, tintColor: 'white' }}></Image>
          <Text style={styles.textHeader}>Perfil privado 3</Text>
        </View>
        <View style={styles.content}>
          <View style={{ gap: 4 }}>
            <Text style={styles.textNormal}>Nombre del proveedor</Text>
            <Text style={styles.textNormal}>Número del proveedor</Text>
            <Text style={styles.textNormal}>No. lote</Text>
            <Text style={styles.textNormal}>Fecha de manufactura</Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ textAlign: 'right' }}>{partsEdomex.providerName}</Text>
            <Text style={{ textAlign: 'right' }}>{partsEdomex.providerId != '26' ? '26' : '26'}</Text>
            <Text style={{ textAlign: 'right' }}>{partsEdomex.batchNumber}</Text>
            <Text style={{ textAlign: 'right' }}>20{partsEdomex.manufacturedYear}</Text>
          </View>
        </View>
      </View>
    );
  } else if (info) {
    return (
      <View style={styles.body}>
        <View style={[styles.containerWithColor, stylesTemplate.primaryColor]}>
          <Image resizeMode="contain" source={require('../../assets/icons/person_outline.png')} style={{ width: 16, tintColor: 'white' }}></Image>
          <Text style={styles.textHeader}>Perfil privado 3</Text>
        </View>
        <View style={styles.content}>
          <View style={{ gap: 4 }}>
            <Text style={styles.textNormal}>Nombre del proveedor</Text>
            <Text style={styles.textNormal}>Número del proveedor</Text>
            <Text style={styles.textNormal}>No. lote</Text>
            <Text style={styles.textNormal}>Fecha de manufactura</Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ textAlign: 'right' }}>Vifinsa</Text>
            <Text style={{ textAlign: 'right' }}>26</Text>
            <Text style={{ textAlign: 'right' }}>010</Text>
            <Text style={{ textAlign: 'right' }}>2025</Text>
          </View>
        </View>
      </View>
    );
  }
};

const BodyLevelOfClearanceC: React.FC<BodyLevelOfClearanceProps> = ({ parts, partsEdomex, navigation, info }) => {
  if (parts) {
    return (
      <View style={styles.containerButton}>
        <TouchableOpacity
          onPress={() => {
            if (navigation) {
              navigation.navigate('InfractionsScreen');
            }
          }}
          style={[styles.button, stylesTemplate.primaryColor]}>
          <Text style={styles.buttonText}>Infracciones</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (partsEdomex) {
    return (
      <View style={styles.body}>
        <View style={[styles.containerWithColor, stylesTemplate.primaryColor]}>
          <Image resizeMode="contain" source={require('../../assets/icons/person_outline.png')} style={{ width: 16, tintColor: 'white' }}></Image>
          <Text style={styles.textHeader}>Perfil privado 4</Text>
        </View>
        <View style={styles.content}>
          <View style={{ gap: 4 }}>
            <Text style={styles.textNormal}>Holograma</Text>
            <Text style={styles.textNormal}>Semestre del certificado</Text>
            <Text style={styles.textNormal}>Año de vigencia</Text>
            <Text style={styles.textNormal}>Placa</Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ textAlign: 'right' }}>{partsEdomex.holo}</Text>
            <Text style={{ textAlign: 'right' }}>{partsEdomex.semester}</Text>
            <Text style={{ textAlign: 'right' }}>{partsEdomex.expirationDate}</Text>
            <Text style={{ textAlign: 'right' }}>{partsEdomex.serial}</Text>
          </View>
        </View>
      </View>
    );
  } else if (info) {
    return (
      <View style={styles.body}>
        <View style={[styles.containerWithColor, stylesTemplate.primaryColor]}>
          <Image resizeMode="contain" source={require('../../assets/icons/person_outline.png')} style={{ width: 16, tintColor: 'white' }}></Image>
          <Text style={styles.textHeader}>Perfil privado 4</Text>
        </View>
        <View style={styles.content}>
          <View style={{ gap: 4 }}>
            <Text style={styles.textNormal}>Holograma</Text>
            <Text style={styles.textNormal}>Semestre del certificado</Text>
            <Text style={styles.textNormal}>Año de vigencia</Text>
            <Text style={styles.textNormal}>Placa</Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ textAlign: 'right' }}>00</Text>
            <Text style={{ textAlign: 'right' }}>2</Text>
            <Text style={{ textAlign: 'right' }}>2025</Text>
            <Text style={{ textAlign: 'right' }}>AAA-000-A</Text>
          </View>
        </View>
      </View>
    );
  }
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
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  body: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25) ', //TODO:
  },
  content: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 4,
    justifyContent: 'space-between',
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
  bottomRadius: { borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  containerButton: {
    width: '100%',
    paddingHorizontal: 42,
  },
  button: {
    paddingVertical: 12,
    backgroundColor: '#4A4546',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    width: '100%',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#fff',
  },
});
