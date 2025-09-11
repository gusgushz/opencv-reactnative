import React, { useEffect, useState } from 'react';
import { Text, View, NativeModules, StyleSheet, TouchableOpacity, ToastAndroid, Alert, Platform, AlertType } from 'react-native';
import { stylesTemplate } from '../theme';
import { sufix } from '../globalVariables';
import Clipboard from '@react-native-clipboard/clipboard';
import { AESEncrypt, AESDecrypt, getDeviceId } from '../utils';

export const AndroidIdScreen = () => {
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    const fetchDeviceId = async () => {
      try {
        const id = (await getDeviceId()) + sufix;
        setDeviceId(AESEncrypt(id));
      } catch (error) {
        console.error('Error fetching Android ID:', error);
      }
    };

    fetchDeviceId();
  }, []);

  const copyToClipboard = (androidId: string) => {
    if (Platform.OS == 'android') {
      ToastAndroid.show('Copiado al portapapeles', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copiado al portapapeles');
    }
    Clipboard.setString(androidId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Id para soporte técnico</Text>
      {deviceId && <Text style={{ textAlign: 'center', fontSize: 16 }}>{deviceId}</Text>}
      <TouchableOpacity style={[styles.button, stylesTemplate.primaryColor]} onPress={() => copyToClipboard(deviceId)}>
        <Text style={styles.buttonText}>Copiar en el portapapeles</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 30,
    gap: 16,
    textAlign: 'center',
    backgroundColor: stylesTemplate.screenBgColor.backgroundColor,
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
  },
  button: {
    marginHorizontal: 12,
    paddingVertical: 12,
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
