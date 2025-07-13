import React, { useEffect, useState } from 'react';
import { Text, View, NativeModules, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { stylesTemplate } from '../theme';
import { sufix } from '../globalVariables';
import Clipboard from '@react-native-clipboard/clipboard';
import { AESEncrypt, AESDecrypt } from '../utils';
const { OpencvFunc } = NativeModules;

export const AndroidIdScreen = () => {
  const [androidId, setAndroidId] = useState<string>('');

  useEffect(() => {
    const fetchAndroidId = async () => {
      try {
        const id = (await OpencvFunc.getAndroidId()) + sufix;
        setAndroidId(AESEncrypt(id));
      } catch (error) {
        console.error('Error fetching Android ID:', error);
      }
    };

    fetchAndroidId();
  }, []);

  const copyToClipboard = (androidId: string) => {
    Clipboard.setString(androidId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Id para soporte técnico</Text>
      {androidId && <Text style={{ textAlign: 'center', fontSize: 16 }}>{androidId}</Text>}
      <TouchableOpacity style={[styles.button, stylesTemplate.primaryColor]} onPress={() => copyToClipboard(androidId)}>
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
