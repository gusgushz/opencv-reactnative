import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { stylesTemplate } from '../theme';
import { LoginScreenProps } from '../navigation/NavigationProps';
// import { useUserContext } from '../contexts/UserContext.tsx';
import { UserSession } from '../models';
import { getUsersData, readableString, storeUser, storeUserSession } from '../utils';

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  // const { setUser, setUserSession } = useUserContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [warning, setWarning] = useState('');

  const handleLogin = () => {
    setIsLoading(true);
    if (!email || !password) {
      setIsLoading(false);
      return setWarning('Por favor, completa todos los campos.');
    }
    const usersData = getUsersData();
    if (!usersData) {
      setIsLoading(false);
      return setWarning('No hay datos de usuarios disponibles.');
    }
    const user = usersData.created.find(user => user.email === email.toLowerCase().trim() && readableString(user.password) === password.trim());
    if (!user) {
      setIsLoading(false);
      return setWarning('Correo o contraseña incorrectos.');
    }
    const userToSave: UserSession = {
      email: user.email,
      name: user.name,
      role: user.role,
    };
    setWarning('');
    storeUserSession(userToSave);
    storeUser({ ...userToSave, state_id: user.state_id });
    setIsLoading(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, stylesTemplate.screenBgColor]}>
      <View style={{ width: '100%', gap: 24 }}>
        <View style={{ gap: 4 }}>
          <Text style={styles.title}>Correo</Text>
          <TextInput
            placeholder="Correo"
            placeholderTextColor={'#747474'}
            value={email}
            onChangeText={setEmail}
            selectionColor={stylesTemplate.primaryColor.backgroundColor}
            style={styles.input}
          />
        </View>
        <View style={{ gap: 4 }}>
          <Text style={styles.title}>Contraseña</Text>
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor={'#747474'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            selectionColor={stylesTemplate.primaryColor.backgroundColor}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} disabled={isLoading} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
      {warning ? <Text style={{ color: 'red' }}>{warning}</Text> : null}
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 16,
    paddingBottom: 50,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: stylesTemplate.primaryColor.backgroundColor },
  inputContainer: {
    width: '100%',
    //position: 'relative',
  },
  input: {
    width: '100%',
    backgroundColor: '#DEDCDC',
    borderRadius: 5,
    paddingHorizontal: 24,
    color: 'black',
    paddingVertical: 16,
  },
  button: {
    marginHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: stylesTemplate.primaryColor.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    width: '60%',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#fff',
  },
});
