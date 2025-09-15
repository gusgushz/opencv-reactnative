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
    documents,
  } = route.params;

  const [link, setLink] = useState<string>(url);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        setLink(await getLink(url));
      } catch (error) {
        setLink('Error al cargar la URL');
      }
    };
    fetchLink();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLink();
    });
    return unsubscribe;
  }, []);

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

      {roleLevel == RoleLevels.ONE && (
        <BodyLevelOfClearanceA
          expirationDate={expirationDate}
          serial={serial}
          state={state}
          typeServiceText={typeServiceText}
          documents={documents}
        />
      )}

      {roleLevel == RoleLevels.TWO && (
        <>
          <BodyLevelOfClearanceA
            expirationDate={expirationDate}
            serial={serial}
            state={state}
            typeServiceText={typeServiceText}
            documents={documents}
          />
          <BodyLevelOfClearanceB manufacturedYear={manufacturedYear} provider={provider} providerNumber={providerNumber} batch={batch} />
        </>
      )}

      {roleLevel == RoleLevels.THREE && (
        <>
          <BodyLevelOfClearanceA
            expirationDate={expirationDate}
            serial={serial}
            state={state}
            typeServiceText={typeServiceText}
            documents={documents}
          />
          <BodyLevelOfClearanceB manufacturedYear={manufacturedYear} provider={provider} providerNumber={providerNumber} batch={batch} />
          <View style={styles.containerButton}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('InfractionsScreen');
              }}
              style={[styles.button, stylesTemplate.primaryColor]}>
              <Text style={styles.buttonText}>Infracciones</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

type BodyLevelOfClearanceAProps = Pick<Parts, 'expirationDate' | 'typeServiceText' | 'serial' | 'state' | 'documents'>;

const BodyLevelOfClearanceA: React.FC<BodyLevelOfClearanceAProps> = ({ expirationDate, typeServiceText, serial, state, documents }) => {
  return (
    <View style={styles.body}>
      <View style={[styles.containerWithColor, stylesTemplate.primaryColor]}>
        <Image resizeMode="contain" source={require('../../assets/icons/person_outline.png')} style={{ width: 16, tintColor: 'white' }}></Image>
        <Text style={styles.textHeader}>Perfil privado 2</Text>
      </View>
      {/* <View style={styles.content}>
        <View style={{ gap: 4 }}>
          <Text style={styles.textNormal}>Vigencia:</Text>
          <Text style={styles.textNormal}>Servicio:</Text>
          <Text style={styles.textNormal}>Serie:</Text>
          <Text style={styles.textNormal}>Región:</Text>
          <Text style={styles.textNormal}>Documentos:</Text>
        </View>
        <View style={{ gap: 4, maxWidth: '70%' }}>
          <Text style={{ textAlign: 'right' }}>{expirationDate}</Text>
          <Text numberOfLines={2} style={{ textAlign: 'right' }}>
            {typeServiceText}
          </Text>
          <Text style={{ textAlign: 'right' }}>{serial}</Text>
          <Text style={{ textAlign: 'right' }}>{state}</Text>
          <Text style={{ textAlign: 'right' }}>{documents.join(', ')}</Text>
        </View>
      </View> */}
      <View style={{ paddingVertical: 12, gap:4 }}>
        <Row label={'Vigencia'} item={expirationDate}></Row>
        <Row label={'Servicio'} item={typeServiceText}></Row>
        <Row label={'Serie'} item={serial}></Row>
        <Row label={'Región'} item={state}></Row>
        <Row label={'Documentos'} item={documents.join(', ')}></Row>
      </View>
    </View>
  );
};
type RowProps = { label: string; item: string };
const Row: React.FC<RowProps> = ({ label, item }) => {
  // []
  return (
    <View style={{ flexDirection: 'row', gap: 4, paddingHorizontal: 24 }}>
      <Text style={[styles.textNormal, { flex: 3 }]}>{label}:</Text>
      <Text numberOfLines={2} style={{ textAlign: 'right', flex: 8 }}>
        {item}
      </Text>
    </View>
  );
};

type BodyLevelOfClearanceBProps = Pick<Parts, 'provider' | 'providerNumber' | 'batch' | 'manufacturedYear'>;

const BodyLevelOfClearanceB: React.FC<BodyLevelOfClearanceBProps> = ({ provider, providerNumber, batch, manufacturedYear }) => {
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
          <Text style={{ textAlign: 'right' }}>{provider}</Text>
          <Text style={{ textAlign: 'right' }}>{providerNumber}</Text>
          <Text style={{ textAlign: 'right' }}>{batch}</Text>
          <Text style={{ textAlign: 'right' }}>{manufacturedYear}</Text>
        </View>
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
    alignContent: 'center',
    width: '100%',
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
