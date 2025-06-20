import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { stylesTemplate } from '../theme';

export const InfractionsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Infractions</Text>
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
