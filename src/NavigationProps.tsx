import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/*Especificaciones
Van en orden, donde spec[0] es el primero hasta spec[13]
SERVICIO, SERIE, DOCUMENTOS, NOMBREPROVEEDOR, NUMEROPROVEEDOR, LOTE
*/
type Specs = {
  uno: string; // ???????ID
  plateType: string; //"Delantero"  "Trasero"  "Engomado" "Tarjeta"
  tres: string;
  plateNumberType: string; //0 -> "Delantero"   1 -> "Trasero"  2 -> "Engomado" 3 -> "Tarjeta"
  plate: string; // Numeros-letras de la placa
  whichVehicleNumber: string; //Region
  whichVehicleText: string; //Tipo de vehiculo
  state: string; //Estado (del país)
  nueve: string;
  companyName: string; //Nombre del proveedor
  batch: string; //lote
  validity: string; //vigencia 20xx-20xx
  manufactureYear: string; //año de producción/manufactura
  url: string; //URL de la dependencia de gobierno
};

export type RootStackParamList = {
  Home: {} | undefined;
  Camera: {} | undefined;
  Information: {
    uno: string;
    plateType: string; //"Delantero"  "Trasero"  "Engomado" "Tarjeta"
    tres: string;
    plateNumberType: string; //0 -> "Delantero"   1 -> "Trasero"  2 -> "Engomado" 3 -> "Tarjeta"
    plate: string; // Numeros-letras de la placa
    whichVehicleNumber: string; //Region
    whichVehicleText: string; //Tipo de vehiculo
    state: string; //Estado (del país)
    nueve: string;
    companyName: string; //Nombre del proveedor
    batch: string; //lote
    validity: string; //vigencia 20xx-20xx
    manufactureYear: string; //año de producción/manufactura
    url: string; //URL de la dependencia de gobierno
  };
  // RentRequests: { showSnackbar: boolean } | undefined;
};

export type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type CameraProps = NativeStackScreenProps<RootStackParamList, 'Camera'>;
export type InformationProps = NativeStackScreenProps<RootStackParamList, 'Information'>;
