import { StyleSheet, Text, View } from 'react-native';
import { CameraView } from '../components';

export const CameraXScreen = () => {
  return <CameraView style={{ flex: 1 }}></CameraView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
