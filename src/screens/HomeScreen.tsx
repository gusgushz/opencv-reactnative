import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { HomeScreenProps } from '../navigation/NavigationProps';
import { stylesTemplate } from '../theme';
import { RoleLevels, isDemo, logo } from '../globalVariables';
import { SECURITY_LEVEL } from 'dotenv';
import { UserSession } from '../models';
import { getUserSession, removeUser, removeUserSession, storeUserSession } from '../utils';
import { useIsFocused } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [count, setCount] = useState<number>(0);
  const [userSession, setUserSession] = useState<UserSession | null>(getUserSession());
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!userSession && SECURITY_LEVEL === 'private') {
      const userSecurityLevelRole: UserSession = {
        email: '',
        name: '',
        role: '4',
      };
      storeUserSession(userSecurityLevelRole);
      setUserSession(userSecurityLevelRole);
    } else {
      const Session = getUserSession();
      if (Session) setUserSession(Session);
    }
  }, [isFocused]);

  if (isDemo && SECURITY_LEVEL === 'public')
    //REFACTOR: PARA EL MODO DEMO
    return (
      <View style={[styles.container, stylesTemplate.screenBgColor]}>
        <Image source={logo()} resizeMode="contain" style={{ width: '100%', height: height * 0.3, marginVertical: 24 }} />
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('CameraScreen', { roleLevel: RoleLevels.THREE });
            }}
            style={[styles.button, stylesTemplate.primaryColor]}>
            <Text style={styles.buttonText}>Escanear código</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

  return (
    <View style={[styles.container, stylesTemplate.screenBgColor]}>
      <View style={{ width: '100%', height: height * 0.3, justifyContent: 'center' }}>
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
          <Image source={logo()} resizeMode="contain" style={{ width: '100%' }} />
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={() => {
            if (userSession) {
              navigation.navigate('CameraScreen', { roleLevel: userSession.role });
            } else {
              navigation.navigate('CameraScreen', { roleLevel: RoleLevels.ZERO });
            }
          }}
          style={[styles.button, stylesTemplate.primaryColor]}>
          <Text style={styles.buttonText}>Escanear código</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => {
            navigation.navigate('CameraXScreen');
          }}
          style={[styles.button, stylesTemplate.primaryColor]}>
          <Text style={styles.buttonText}>CAMARA X</Text>
        </TouchableOpacity> */}
        {SECURITY_LEVEL !== 'private' && (
          <>
            {userSession ? (
              <>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('ProfileScreen');
                  }}
                  style={[styles.button, stylesTemplate.primaryColor]}>
                  <Text style={styles.buttonText}>Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    removeUserSession();
                    removeUser();
                    setUserSession(null);
                  }}
                  style={[styles.button, stylesTemplate.primaryColor]}>
                  <Text style={styles.buttonText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('LoginScreen');
                }}
                style={[styles.button, stylesTemplate.primaryColor]}>
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
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
  buttonsContainer: { width: '100%', gap: 10 },
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
  text: {
    fontSize: 20,
    color: 'black',
  },
});
