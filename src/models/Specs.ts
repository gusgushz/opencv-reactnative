//TODO: en el repo se encontró el valor en la carpeta raiz holoApp.core/models/LicensePlate.cs
export interface Specs {
  version: string;
  codeType: string; //"Delantero"  "Trasero"  "Engomado" "Tarjeta" // documents D(F),T,E,C
  chainLength: string;
  permissionLevel: string; //0 -> "Delantero"   1 -> "Trasero"  2 -> "Engomado" 3 -> "Tarjeta"
  serial: string; // Numeros-letras de la placa // serie de placa
  typeServiceId: string; //Id del parent_service
  typeServiceText: string; //Tipo de servicio //El que se busca con la lista de servicios
  state: string; //Estado (del país)
  batch: string; //Lote
  provider: string; //Nombre del proveedor
  providerNumber: string; //lote
  expirationDate: string; //vigencia 20xx-20xx
  manufacturedYear: string; //año de producción/manufactura
  url: string; //URL de la dependencia de gobierno
}
export type Parts = Specs & {
  documents: string[];
};
export interface PartsEdomex {
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
export interface PartsEdomexFromScan {
  folio: string; //Folio
  providerId: string; //Id del proveedor
  batchNumber: string; //Lote
  manufacturedYear: string; //año de manufactura, SOLO TOMAR LOS 2 PRIMEROS DIGITOS
  stateId: string; //Id del estado
  certificate: string; //Holograma-tipo de certificado de verificación #PUEDE SER: 0,00,1,2
}
