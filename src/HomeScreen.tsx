import React from 'react';
import { StyleSheet,View, Text, TouchableOpacity } from 'react-native';
import { HomeProps } from './NavigationProps';

export const Home = ({ navigation }: HomeProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>HomeScreen</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Camera')} style={styles.buttonDarkBlue}>
        <Text style={styles.buttonText}>Escanear código</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDarkBlue: {
    width: 250,
    height: 60,
    backgroundColor: 'darkblue',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 12,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#fff',
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
});
