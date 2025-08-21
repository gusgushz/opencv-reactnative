import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, NativeModules, Image, TouchableWithoutFeedback } from 'react-native';
import { stylesTemplate } from '../theme';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { base64Decode, removeToken, storeKey } from '../utils';
import { SECURITY_LEVEL } from 'dotenv';
import { DownloadSecretKeyScreenProps } from '../navigation/NavigationProps';
const { OpencvFunc } = NativeModules;

export const DownloadSecretKeyScreen = ({ navigation }: DownloadSecretKeyScreenProps) => {
  const [url, setUrl] = useState<string>('');
  const [exists, setExists] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [warning, setWarning] = useState<string>('');
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const checkFileExists = async () => {
      try {
        const fileExists = await RNFS.exists(`${RNFS.ExternalDirectoryPath}/secretKey.dat`);
        setExists(fileExists);
      } catch (error) {
        console.error('Error checking file existence:', error);
      }
    };
    checkFileExists();
  }, [exists]);

  const handleDownload = async () => {
    if (!url || isLoading || exists) return;

    setIsLoading(true);
    setWarning('');

    try {
      let processedUrl = url.trim(); // Limpiar espacios
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'http://' + processedUrl; //FIXME: cambiar el prefijo a https://
      }
      processedUrl = processedUrl.replace('https://', 'http://'); //FIXME: eliminar cuando ya se corrija el backend
      console.log('URL de descarga:', processedUrl);

      const downloadResult = await RNFS.downloadFile({
        fromUrl: processedUrl,
        toFile: `${RNFS.ExternalDirectoryPath}/secretKey.dat`,
      }).promise;

      if (downloadResult.statusCode === 200) {
        const exists = await RNFS.exists(`${RNFS.ExternalDirectoryPath}/secretKey.dat`);
        if (exists) {
          setWarning('Clave Descargada');
          const content = await RNFS.readFile(`${RNFS.ExternalDirectoryPath}/secretKey.dat`, 'utf8');
          const keyDecoded = base64Decode(content);
          removeToken();
          storeKey(keyDecoded);
          setExists(true);
          console.log('Clave descargada:', keyDecoded);
          await OpencvFunc.exitAppWithMessage('Clave descargada. Volver a abrir la aplicación para continuar.');
        }
      } else {
        setWarning('Error al descargar la clave. Verifique la URL.');
      }
    } catch (error) {
      console.error('Download error:', error);
      setWarning('Error al descargar la clave. Verifique la URL.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, stylesTemplate.screenBgColor]}>
      <TouchableWithoutFeedback
        onPress={() => {
          if (SECURITY_LEVEL === 'private') {
            setCount(count + 1);
            if (count == 4) {
              setCount(0);
              navigation.navigate('AndroidIdScreen');
            }
          }
        }}>
        <Image source={require('../../assets/logo.png')} resizeMode="center" style={{ marginBottom: -16 }} />
      </TouchableWithoutFeedback>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="Ingrese su clave secreta"
        placeholderTextColor="#888"
        autoCapitalize="none"
        selectionColor={'#D9D9D9'}
        cursorColor={stylesTemplate.primaryColor.backgroundColor}
        selectionHandleColor={stylesTemplate.primaryColor.backgroundColor}
      />
      <TouchableOpacity
        disabled={exists || isLoading || url === ''}
        style={exists || isLoading || url === '' ? styles.button : [styles.button, stylesTemplate.primaryColor]}
        onPress={handleDownload}>
        {isLoading ? (
          <ActivityIndicator size={'small'} color="#fff"></ActivityIndicator>
        ) : (
          <Text style={styles.buttonText}>{exists ? 'Clave descargada' : 'Descargar clave'}</Text>
        )}
      </TouchableOpacity>
      <Text style={{ color: exists ? 'blue' : 'red' }}>{warning}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    marginHorizontal: 12,
    paddingVertical: 12,
    paddingHorizontal: 48,
    backgroundColor: '#4A4546',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#fff',
  },
});
