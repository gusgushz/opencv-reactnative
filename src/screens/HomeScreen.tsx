import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, TouchableWithoutFeedback, Dimensions, NativeModules } from 'react-native';
import { HomeScreenProps } from '../navigation/NavigationProps';
import { stylesTemplate } from '../theme';
import { RoleLevels, sufix } from '../globalVariables';
import { SECURITY_LEVEL } from 'dotenv';
import { UserSession } from '../models';
import { base64Encode, getDaysDifference, getKey, getToken, getUserSession, removeUser, removeUserSession, storeUserSession } from '../utils';
import { useIsFocused } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';

const { OpencvFunc } = NativeModules;
const { height } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [count, setCount] = useState<number>(0);
  const [userSession, setUserSession] = useState<UserSession | null>(getUserSession());
  const isFocused = useIsFocused();

  const getInfo = async () => {
    const androidId = await OpencvFunc.getAndroidId();
    console.log('Android ID:', androidId + sufix);
    setAndroidId(androidId + sufix);
  };
  const [androidId, setAndroidId] = useState<string>('');
  const token = getToken() ?? '';
  const key = getKey() ?? '';
  const chain = base64Encode(key + '.' + androidId);
  const daysDiff = getDaysDifference();

  useEffect(() => {
    if (!userSession) {
      if (SECURITY_LEVEL === 'private') {
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
    }
    getInfo();
  }, [isFocused]);

  return (
    <View style={[styles.container, stylesTemplate.screenBgColor]}>
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
        <Image source={require('../../assets/logohome.png')} resizeMode="contain" style={styles.image} />
      </TouchableWithoutFeedback>
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
      {/* <Text style={[styles.text, { fontFamily: 'serif' }]}>Key {key}</Text>
      <Text style={[styles.text, { fontFamily: 'serif' }]}>AndroidId {androidId}</Text>
      <TouchableOpacity style={[styles.button, stylesTemplate.primaryColor]} onPress={() => Clipboard.setString(chain)}>
        <Text style={[styles.text, { fontFamily: 'serif' }]}>Chain {chain}</Text>
      </TouchableOpacity>
      <Text style={[styles.text, { fontFamily: 'serif' }]}>Días desde la última validación: {daysDiff}</Text>
      <TouchableOpacity style={[styles.button, stylesTemplate.primaryColor]} onPress={() => Clipboard.setString(token)}>
        <Text style={[styles.text, { fontFamily: 'serif' }]}>Token: {token}</Text>
      </TouchableOpacity> */}
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
  image: { marginBottom: 30, marginTop: 16, height: height * 0.25 },
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
