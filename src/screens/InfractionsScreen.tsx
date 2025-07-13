import React from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { stylesTemplate } from '../theme';

export const InfractionsScreen = () => {
  const { height } = useWindowDimensions();
  return (
    <View style={[styles.containerNoInfo, { paddingTop: height / 3 }]}>
      <Image source={require('../../assets/icons/Vector.png')} resizeMode="contain" style={{ width: '30%' }}></Image>
      <Text style={styles.text}>Sin infracciones</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  containerNoInfo: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: stylesTemplate.screenBgColor.backgroundColor,
    alignItems: 'center',
    gap: 8,
  },
  text: {
    textAlign: 'center',
    fontSize: 17,
  },
});
