import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { stylesTemplate } from '../theme';
import { LoginScreenProps } from '../navigation/NavigationProps';
import { UpdateByTimestampData, UserCreated, UserSession } from '../models';
import { getUsersData, readableString } from '../utils';
import { useUserContext } from '../contexts/UserContext';
import { getUpdateByTimestamp } from '../api';

export const LoginScreenInputsAnim = ({ navigation }: LoginScreenProps) => {
  const { setUser, setUserSession } = useUserContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [warning, setWarning] = useState('');

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const emailAnim = useRef(new Animated.Value(email !== '' ? 1 : 0)).current;
  const passwordAnim = useRef(new Animated.Value(password !== '' ? 1 : 0)).current;

  const animateLabel = (anim: Animated.Value, toValue: number) => {
    Animated.timing(anim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = (setFocus: (val: boolean) => void, anim: Animated.Value) => {
    setFocus(true);
    animateLabel(anim, 1);
  };

  const handleBlur = (setFocus: (val: boolean) => void, anim: Animated.Value, value: string) => {
    setFocus(false);
    if (value === '') {
      animateLabel(anim, 0);
    }
  };

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
    setUserSession(userToSave);
    setUser({ ...userToSave, state_id: user.state_id });
    setIsLoading(false);
    navigation.navigate('HomeScreen');
  };

  return (
    <View style={[styles.container, stylesTemplate.screenBgColor]}>
      <View style={{ width: '100%', gap: 24 }}>
        <AnimatedInput
          label="Correo"
          value={email}
          onChangeText={setEmail}
          animValue={emailAnim}
          isFocused={emailFocused}
          onFocus={() => handleFocus(setEmailFocused, emailAnim)}
          onBlur={() => handleBlur(setEmailFocused, emailAnim, email)}
        />
        <AnimatedInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          animValue={passwordAnim}
          isFocused={passwordFocused}
          onFocus={() => handleFocus(setPasswordFocused, passwordAnim)}
          onBlur={() => handleBlur(setPasswordFocused, passwordAnim, password)}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} disabled={isLoading} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
      {warning ? <Text style={{ color: 'red' }}>{warning}</Text> : null}
    </View>
  );
};

interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  animValue: Animated.Value;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  secureTextEntry?: boolean;
}

const AnimatedInput = ({ label, value, onChangeText, animValue, isFocused, onFocus, onBlur, secureTextEntry = false }: AnimatedInputProps) => {
  const inputRef = useRef<TextInput>(null);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const fontSize = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 20],
  });

  const color = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#747474', stylesTemplate.primaryColor.backgroundColor],
  });

  const top = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 4],
  });

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View style={styles.inputContainer}>
        <Animated.Text
          style={[
            styles.placeholder,
            {
              transform: [{ translateY }],
              position: 'absolute',
              left: 12,
              top,
              fontSize,
              color,
            },
          ]}>
          {label}
        </Animated.Text>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          selectionColor={stylesTemplate.primaryColor.backgroundColor}
          style={styles.input}
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 16,
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
  },
  input: {
    width: '100%',
    backgroundColor: '#DEDCDC',
    borderRadius: 5,
    paddingHorizontal: 24,
    color: 'black',
    paddingVertical: 16,
  },
  placeholder: {
    zIndex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
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
