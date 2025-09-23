import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  HomeScreen: {} | undefined;
  CameraScreen: { roleLevel: string };
  InformationScreen:
    | {
        roleLevel: string;
        version: string;
        codeType: string; //"Delantero"  "Trasero"  "Engomado" "Tarjeta" // documents D(F),T,E,C
        chainLength: string;
        permissionLevel: string; //0 -> "Delantero"   1 -> "Trasero"  2 -> "Engomado" 3 -> "Tarjeta"
        serial: string; // Numeros-letras de la placa // serie de placa
        typeServiceId: string; //Region //whichVehicleNumber
        typeServiceText: string; //Tipo de vehiculo //El que se agrega manual en el decoder
        state: string; //Estado (del país)
        batch: string; //Lote
        provider: string; //Nombre del proveedor
        providerNumber: string; //lote
        expirationDate: string; //vigencia 20xx-20xx
        manufacturedYear: string; //año de producción/manufactura
        url: string; //URL de la dependencia de gobierno
        documents: string[];
      }
    | {
        roleLevel: string;
        url: string;
        folio: string;
        providerName: string;
        providerId: string;
        batchNumber: string;
        manufacturedYear: string; //año de manufactura
        holo: string; //Holograma
        semester: string; //Semestre
        expirationDate: string; //vigencia 20xx-20xx
        serial: string; // Numeros-letras de la placa // serie de placa
      }
    | {
        roleLevel: string;
        info: string;
      };
  ProfileScreen: {} | undefined;
  // RentRequests: { showSnackbar: boolean } | undefined;
  LoginScreen: {} | undefined;
  InfractionsScreen: {} | undefined;
  DownloadSecretKeyScreen: {} | undefined;
  AndroidIdScreen: {} | undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;
export type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'CameraScreen'>;
export type InformationScreenProps = NativeStackScreenProps<RootStackParamList, 'InformationScreen'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'ProfileScreen'>;
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'LoginScreen'>;
export type InfractionsScreenProps = NativeStackScreenProps<RootStackParamList, 'InfractionsScreen'>;
export type DownloadSecretKeyScreenProps = NativeStackScreenProps<RootStackParamList, 'DownloadSecretKeyScreen'>;
export type AndroidIdScreenProps = NativeStackScreenProps<RootStackParamList, 'AndroidIdScreen'>;
