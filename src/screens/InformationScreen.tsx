import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { InformationScreenProps } from '../navigation/NavigationProps';
import { stylesTemplate } from '../theme';
import { getLink } from '../api';
//prettier-ignore
import { URLButton, BodyLevelA, BodyLevelB, BodyLevelC, BodyLevelAEdomex, BodyLevelBEdomex,BodyLevelCedomex } from '../components/BodyLevelOfClearance';
import { isDemo } from '../globalVariables';

export const InformationScreen = ({ route, navigation }: InformationScreenProps) => {
  const { roleLevel } = route.params;
  const [visibilityLevels, setVisibilityLevels] = useState<boolean[]>([false, false, false]);
  const [link, setLink] = useState<string>();

  useEffect(() => {
    const handleVisibilityLevels = (roleLevel: string) => {
      if (roleLevel == '2') return setVisibilityLevels([true, false, false]);
      if (roleLevel == '3') return setVisibilityLevels([true, true, false]);
      if (roleLevel == '4') return setVisibilityLevels([true, true, true]);
    };
    console.log('roleLevel:', roleLevel);
    handleVisibilityLevels(roleLevel);
  }, [roleLevel]);

  if ('documents' in route.params) {
    const { batch, documents, expirationDate, manufacturedYear, provider, providerNumber, serial, state, typeServiceText, url } = route.params;
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
        <URLButton link={link} />
        {visibilityLevels[0] && (
          <BodyLevelA expirationDate={expirationDate} serial={serial} state={state} typeServiceText={typeServiceText} documents={documents} />
        )}
        {visibilityLevels[1] && <BodyLevelB manufacturedYear={manufacturedYear} provider={provider} providerNumber={providerNumber} batch={batch} />}
        {visibilityLevels[2] && <BodyLevelC navigation={navigation} />}
      </View>
    );
  } else if ('holo' in route.params) {
    const { batchNumber, expirationDate, folio, holo, manufacturedYear, providerId, providerName, semester, serial, url } = route.params;
    useEffect(() => {
      setLink(url);
      // NOTE: En caso de que luego el codigo edomex agregue una URL de rebrandly usar el fetchLink arriba
    }, []);
    return (
      <View style={[styles.container, stylesTemplate.screenBgColor]}>
        <URLButton link={link} />
        {visibilityLevels[0] && BodyLevelAEdomex(folio)}
        {visibilityLevels[1] && BodyLevelBEdomex(providerName, providerId, batchNumber, manufacturedYear)}
        {visibilityLevels[2] && BodyLevelCedomex(holo, semester, expirationDate, serial)}
      </View>
    );
  } else {
    if (isDemo) {
      //REFACTOR: PARA EL MODO DEMO
      const { info } = route.params;
      if (!info.includes('_')) {
        return (
          <View style={[styles.container, stylesTemplate.screenBgColor, { padding: 24 }]}>
            <Text style={{ fontSize: 24 }}>{info}</Text>
          </View>
        );
      }
      //prettier-ignore
      const labels = [ 'version', 'codeType', 'chainLength', 'permissionLevel/nivel de permiso', 'serial/placa', 'typeServiceId', 'typeServiceText', 'state', 'batch', 'provider', 'providerId', 'expirationDate', 'manufacturedYear', 'url'];
      useEffect(() => {
        const fetchLink = async () => {
          try {
            setLink(await getLink(info.split('_')[13]));
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
      const rawInfo = info.split('_');
      rawInfo.splice(6, 1);
      return (
        <View style={[styles.container, stylesTemplate.screenBgColor, { padding: 24, gap: 12 }]}>
          {info.split('_').map((item, index) => (
            <Text key={index} style={styles.textNormal}>
              {labels[index]}: {item}
            </Text>
          ))}
          <Text>URL decodificada: {link}</Text>
          <Text style={{ marginTop: 24, fontWeight: 'bold' }}>{rawInfo.join('_')}</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.container, stylesTemplate.screenBgColor]}>
          <URLButton link={'https://edomex.gob.mx/'} />
          {visibilityLevels[0] && BodyLevelAEdomex()}
          {visibilityLevels[1] && BodyLevelBEdomex()}
          {visibilityLevels[2] && BodyLevelCedomex()}
        </View>
      );
    }
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', gap: 16, paddingVertical: 12 },
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
  textNormal: { fontSize: 14, color: 'black' },
});
