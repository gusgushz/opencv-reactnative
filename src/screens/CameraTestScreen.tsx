import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraTestScreenProps } from '../navigation/NavigationProps';

export const CameraTestScreen = ({ navigation }: CameraTestScreenProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ backgroundColor: 'lightblue', paddingHorizontal: 24, paddingVertical: 12, elevation: 4 }}
        onPress={() => navigation.navigate('CameraScreen', { roleLevel: '4' })}>
        <Text>CameraTestScreen</Text>
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
});
