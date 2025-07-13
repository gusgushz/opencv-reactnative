import { Text, View, StyleSheet } from 'react-native';
import { stylesTemplate } from '../theme';
import { ProfileScreenProps } from '../navigation/NavigationProps';
// import { useUserContext } from '../contexts/UserContext.tsx';
import { getUser } from '../utils';

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  // const { user } = useUserContext();
  const user = getUser();
  if(!user) return null; 

  return (
    <View style={[{ padding: 20, flex: 1 }, stylesTemplate.screenBgColor]}>
      <View style={[styles.container, stylesTemplate.primaryColor]}>
        <Text style={styles.title}>Nombre de usuario:</Text>
        <Text style={styles.text}>{user.name}</Text>
        <Text style={styles.title}>Nivel de permiso:</Text>
        <Text style={styles.text}>{user.role}</Text>
        <Text style={styles.title}>Correo:</Text>
        <Text style={styles.text}>{user.email}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 8,
    marginVertical: 10,
    gap: 4,
    paddingBlock: 20,
  },
  title: { fontSize: 15, fontWeight: 'bold', color: 'white' },
  text: { color: 'white', paddingLeft: 12 },
});
