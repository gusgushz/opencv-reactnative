import { UserCreated, UserModified, UserDeleted } from './';
export interface UpdateByTimestamp {
  data: {
    created: UserCreated[];
    modified: UserModified[];
    deleted: UserDeleted[];
  };
  lastUpdated: string; //Date
}
export type UpdateByTimestampData = {
  //Lo que se retorna despues de desencriptar
  created: UserCreated[];
  modified: UserModified[];
  deleted: UserDeleted[];
};
export type UpdateByTimestampEncrypted = {
  data: string; //cadena encriptada
  lastUpdated: string; //Date
};
