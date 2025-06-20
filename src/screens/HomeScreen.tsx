import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, TouchableWithoutFeedback } from 'react-native';
import { HomeScreenProps } from '../navigation/NavigationProps';
import { stylesTemplate } from '../theme';
import { RoleLevels } from '../globalVariables';
import { useUserContext } from '../contexts/UserContext';
import { SECURITY_LEVEL } from 'dotenv';
import { UserSession } from '../models';

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { setUser, setUserSession, userSession } = useUserContext();
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (SECURITY_LEVEL === 'private' && !userSession) {
      let userSecurityLevelRole: UserSession = {
        email: '',
        name: '',
        role: '4',
      };
      setUserSession(userSecurityLevelRole);
    }
  }, []);

  return (
    <View style={[styles.container, stylesTemplate.screenBgColor]}>
      <TouchableWithoutFeedback
        onPress={() => {
          setCount(count + 1);
          if (SECURITY_LEVEL === 'private' && count == 4) {
            setCount(0);
            navigation.navigate('AndroidIdScreen');
          }
        }}>
        <Image source={require('../../assets/logo.png')} resizeMode="center" />
      </TouchableWithoutFeedback>
      <View style={SECURITY_LEVEL === 'private' ? styles.buttonsContainerPrivate : styles.buttonsContainerPublic}>
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
                    setUserSession(null);
                    setUser(null);
                  }}
                  style={[styles.button, stylesTemplate.primaryColor]}>
                  <Text style={styles.buttonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('LoginScreen');
                }}
                style={[styles.button, stylesTemplate.primaryColor]}>
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
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
    paddingVertical: 16,
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 16,
  },
  buttonsContainerPublic: { width: '100%', gap: 10 },
  buttonsContainerPrivate: { width: '100%', gap: 10, marginTop: '50%' },
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
