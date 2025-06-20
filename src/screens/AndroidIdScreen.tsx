import React, { useEffect, useState } from 'react';
import { Text, View, NativeModules, StyleSheet, TextInput } from 'react-native';
import { stylesTemplate } from '../theme';
import { sufix } from '../globalVariables';
const { OpencvFunc } = NativeModules;

export const AndroidIdScreen = () => {
  const [androidId, setAndroidId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndroidId = async () => {
      try {
        const id = (await OpencvFunc.getAndroidId()) + sufix;
        setAndroidId(id);
      } catch (error) {
        console.error('Error fetching Android ID:', error);
      }
    };

    fetchAndroidId();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Id para soporte técnico</Text>
      {androidId && (
        <TextInput
          showSoftInputOnFocus={false}
          textAlign="center"
          style={{ fontSize: 16 }}
          selectionColor={'#D9D9D9'}
          cursorColor={stylesTemplate.primaryColor.backgroundColor}
          selectionHandleColor={stylesTemplate.primaryColor.backgroundColor}
          value={androidId}></TextInput>
      )}
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
});
