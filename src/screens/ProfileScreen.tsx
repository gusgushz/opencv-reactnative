import { useEffect, useState } from 'react';
import { Text, View, ScrollView, StyleSheet } from 'react-native';
import { stylesTemplate } from '../theme';
import { ProfileScreenProps } from '../navigation/NavigationProps';
import { UpdateByTimestampData, UserCreated, UserProfile } from '../models';
import getUpdateByTimestamp from '../api/getUpdateByTimestamp';
import { base64Decode, readableString } from '../utils';
import { useUserContext } from '../contexts/UserContext';

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const { user } = useUserContext();
  if (!user) return navigation.goBack();
  const [createdUsers, setCreatedUsers] = useState<UpdateByTimestampData>();
  const [key, setKey] = useState('');

  // useEffect(() => {
  //   const fetchCreatedUsers = async () => {
  //     try {
  //       const response = await getUpdateByTimestamp();
  //       console.log('Response:', response);
  //       if (response.status === 'error') return;
  //       console.log('Response:', JSON.parse(readableString(response.data)) as UpdateByTimestampData);
  //       setCreatedUsers(JSON.parse(readableString(response.data)) as UpdateByTimestampData);
  //     } catch (error) {
  //       console.error('Error fetching created users:', error);
  //     }
  //   };
  //   setKey(base64Decode('MnBnMzJScW90N0xXeE5lNg=='));
  //   fetchCreatedUsers();
  // }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {/* https://github.com/deepdatat/holo-code-reader/blob/master/vifinsa_code_reader/Resources/layout/ProfileView.xml */}
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.bodyText}>Correo electrónico: {user.email}</Text>
      <Text style={styles.bodyText}>Nombre de usuario: {user.name}</Text>
      <Text style={styles.bodyText}>Role: {user.role}</Text>
      <Text style={styles.bodyText}>EstadoId: {user.state_id}</Text>

      {createdUsers && (
        <View>
          <Text style={styles.bodyText}>Key: {key}</Text>
          <Text style={styles.title}>Usuarios creados</Text>
          {createdUsers.created.map((user: UserCreated) => {
            const passwordUnhashed = readableString(user.password);
            // const secretKey = base64Decode('MnBnMzJScW90N0xXeE5lNg==');
            return (
              <View key={user.id} style={[styles.container, stylesTemplate.primaryColor]}>
                <Text style={styles.text}>ID: {user.id}</Text>
                <Text style={styles.text}>Nombre: {user.name}</Text>
                <Text style={styles.text}>Email: {user.email}</Text>
                <Text style={styles.text}>EstadoId: {user.state_id}</Text>
                <Text style={styles.text}>Rol: {user.role}</Text>
                <Text style={styles.text}>Contraseña: {user.password}</Text>
                <Text style={styles.text}>Contraseña unhashed: {passwordUnhashed}</Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  bodyText: { fontSize: 18 },
  text: {
    color: 'white',
  },
});
