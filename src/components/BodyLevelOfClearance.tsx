import { View, Image, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Parts, PartsEdomex } from '../models';
import { InformationScreenProps } from '../navigation/NavigationProps';
import { stylesTemplate } from '../theme';

type URLButtonProps = { link: string | undefined };
const URLButton: React.FC<URLButtonProps> = ({ link }) => {
  return (
    <TouchableOpacity
      style={[styles.containerWithColor, stylesTemplate.primaryColor, styles.bottomRadius]}
      onPress={() => {
        if (!link) return;
        Linking.openURL(link);
      }}>
      <Image resizeMode="contain" source={require('../../assets/icons/link.png')} style={{ width: 16, tintColor: 'white' }}></Image>
      <Text style={[styles.textNormal, { color: 'white' }]}>{link}</Text>
    </TouchableOpacity>
  );
};

type BodyLevelAProps = Pick<Parts, 'expirationDate' | 'typeServiceText' | 'serial' | 'state' | 'documents'>;
const BodyLevelA: React.FC<BodyLevelAProps> = ({ expirationDate, typeServiceText, serial, state, documents }) => {
  return (
    <View style={styles.body}>
      <View style={[styles.containerWithColor, stylesTemplate.primaryColor]}>
        <Image resizeMode="contain" source={require('../../assets/icons/person_outline.png')} style={{ width: 16, tintColor: 'white' }}></Image>
        <Text style={styles.textHeader}>Perfil privado 2</Text>
      </View>
      <View style={{ paddingVertical: 12, gap: 4 }}>
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
  return (
    <View style={{ flexDirection: 'row', gap: 4, paddingHorizontal: 24 }}>
      <Text style={[styles.textNormal, { flex: 3 }]}>{label}:</Text>
      <Text numberOfLines={2} style={{ textAlign: 'right', flex: 8 }}>
        {item}
      </Text>
    </View>
  );
};

type BodyLevelBProps = Pick<Parts, 'provider' | 'providerNumber' | 'batch' | 'manufacturedYear'>;

const BodyLevelB: React.FC<BodyLevelBProps> = ({ provider, providerNumber, batch, manufacturedYear }) => {
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

type BodyLevelCProps = {
  navigation: InformationScreenProps['navigation'];
};

const BodyLevelC: React.FC<BodyLevelCProps> = ({ navigation }) => {
  return (
    <View style={styles.containerButton}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('InfractionsScreen');
        }}
        style={[styles.button, stylesTemplate.primaryColor]}>
        <Text style={styles.buttonText}>Infracciones</Text>
      </TouchableOpacity>
    </View>
  );
};
const BodyLevelAEdomex = (folio?: string) => {
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
          <Text style={{ textAlign: 'right' }}>{folio ? folio : 'A20425223'}</Text>
        </View>
      </View>
    </View>
  );
};

const BodyLevelBEdomex = (providerName?: string, providerId?: string, batchNumber?: string, manufacturedYear?: string) => {
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
          <Text style={{ textAlign: 'right' }}>{providerName ? providerName : 'Vifinsa'}</Text>
          <Text style={{ textAlign: 'right' }}>{providerId ? providerId : '26'}</Text>
          <Text style={{ textAlign: 'right' }}>{batchNumber ? batchNumber : '010'}</Text>
          <Text style={{ textAlign: 'right' }}>20{manufacturedYear ? manufacturedYear : '2025'}</Text>
        </View>
      </View>
    </View>
  );
};
const BodyLevelCedomex = (holo?: string, semester?: string, expirationDate?: string, serial?: string) => {
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
          <Text style={{ textAlign: 'right' }}>{holo ? holo : '00'}</Text>
          <Text style={{ textAlign: 'right' }}>{semester ? semester : '2'}</Text>
          <Text style={{ textAlign: 'right' }}>{expirationDate ? expirationDate : 2025}</Text>
          <Text style={{ textAlign: 'right' }}>{serial ? serial : 'AAA-000-A'}</Text>
        </View>
      </View>
    </View>
  );
};

export { URLButton, BodyLevelA, BodyLevelB, BodyLevelC, BodyLevelAEdomex, BodyLevelBEdomex, BodyLevelCedomex };

const styles = StyleSheet.create({
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
  bottomRadius: { borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
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
