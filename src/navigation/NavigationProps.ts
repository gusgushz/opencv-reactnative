import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  HomeScreen: {} | undefined;
  CameraScreen: { roleLevel: string };
  InformationScreen: {
    roleLevel: string;
    info?: string;
  };
  ProfileScreen: {} | undefined;
  LoginScreen: {} | undefined;
  InfractionsScreen: {} | undefined;
  DownloadSecretKeyScreen: {} | undefined;
  AndroidIdScreen: {} | undefined;
  CameraTestScreen: {} | undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;
export type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'CameraScreen'>;
export type InformationScreenProps = NativeStackScreenProps<RootStackParamList, 'InformationScreen'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'ProfileScreen'>;
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'LoginScreen'>;
export type InfractionsScreenProps = NativeStackScreenProps<RootStackParamList, 'InfractionsScreen'>;
export type DownloadSecretKeyScreenProps = NativeStackScreenProps<RootStackParamList, 'DownloadSecretKeyScreen'>;
export type AndroidIdScreenProps = NativeStackScreenProps<RootStackParamList, 'AndroidIdScreen'>;
export type CameraTestScreenProps = NativeStackScreenProps<RootStackParamList, 'CameraTestScreen'>;
