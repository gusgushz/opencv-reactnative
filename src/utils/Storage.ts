import { MMKV } from 'react-native-mmkv'; 
import { Service, UpdateByTimestampData, UserSession, UserProfile } from '../models/';

const storage = new MMKV();

export const storeUserSession = (userSession: UserSession) => {
  console.log('Storing userSession:', userSession);
  storage.set('userSession', JSON.stringify(userSession));
};

export const getUserSession = () => {
  const userSession = storage.getString('userSession');
  if (userSession === undefined) {
    return null;
  } else {
    console.log('Getting userSession:', JSON.parse(userSession));
    return JSON.parse(userSession) as UserSession;
  }
};

export const removeUserSession = () => {
  console.log('Removing userSession');
  storage.delete('userSession');
};

export const storeUser = (user: UserProfile) => {
  console.log('Storing user:', user);
  storage.set('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = storage.getString('user');
  if (user === undefined) {
    return null;
  } else {
    console.log('Getting user:', JSON.parse(user));
    return JSON.parse(user) as UserProfile;
  }
};

export const removeUser = () => {
  console.log('Removing user');
  storage.delete('user');
};

export const storeServices = (services: Service[]) => {
  console.log('Storing services');
  storage.set('services', JSON.stringify(services));
};

export const getServices = () => {
  const services = storage.getString('services');
  if (services === undefined) {
    return null;
  } else {
    console.log('Getting services');
    return JSON.parse(services) as Service[];
  }
};

export const removeServices = () => {
  console.log('Removing services');
  storage.delete('services');
};

export const storeIsFirstLogin = (isFirstLogin: boolean) => {
  console.log('Storing isFirstLogin:', isFirstLogin);
  storage.set('isFirstLogin', JSON.stringify('false'));
};

export const getIsFirstLogin = () => {
  const isFirstLogin = storage.getString('isFirstLogin');
  if (isFirstLogin === undefined) {
    return null;
  } else {
    console.log('Getting isFirstLogin:', JSON.parse(isFirstLogin));
    return JSON.parse(isFirstLogin) as boolean;
  }
};

// export const removeIsFirstLogin = () => {
//   console.log('Removing isFirstLogin');
//   storage.delete('isFirstLogin');
// };


export const storeUsersData = (usersData: UpdateByTimestampData) => {
  console.log('Storing usersData');
  storage.set('usersData', JSON.stringify(usersData));
};

export const getUsersData = () => {
  const usersData = storage.getString('usersData');
  if (usersData === undefined) {
    return null;
  } else {
    console.log('Getting usersData');
    return JSON.parse(usersData) as UpdateByTimestampData;
  }
};

export const removeUsersData = () => {
  console.log('Removing usersData');
  storage.delete('usersData');
};

export const storeToken = (token: string) => {
  console.log('Storing token:', token);
  storage.set('token', JSON.stringify(token));
};

export const getToken = () => {
  const token = storage.getString('token');
  if (token === undefined) {
    return null;
  } else {
    console.log('Getting token:', JSON.parse(token));
    return JSON.parse(token) as string;
  }
};

export const removeToken = () => {
  console.log('Removing token');
  storage.delete('token');
};
export const storeKey = (key: string) => {
  console.log('Storing key:', key);
  storage.set('key', JSON.stringify(key));
};

export const getKey = () => {
  const key = storage.getString('key');
  if (key === undefined) {
    return null;
  } else {
    console.log('Getting key:', JSON.parse(key));
    return JSON.parse(key) as string;
  }
};

export const removeKey = () => {
  console.log('Removing key');
  storage.delete('key');
};

export const storeLastValidateTokenDate = (date: Date) => {
  console.log('Storing date:', date);
  storage.set('date', JSON.stringify(date));
};

export const getLastValidateTokenDate = () => {
  const date = storage.getString('date');
  if (date === undefined) {
    return null;
  } else {
    console.log('Getting date:', JSON.parse(date));
    return JSON.parse(date) as Date;
  }
};

export const removeLastValidateTokenDate = () => {
  console.log('Removing date');
  storage.delete('date');
};

export const storeDaysDifference = (diff: number) => {
  console.log('Storing days diff:', diff);
  storage.set('diff', JSON.stringify(diff));
};
export const getDaysDifference = () => {
  const diff = storage.getString('diff');
  if (diff === undefined) {
    return null;
  } else {
    console.log('Getting date:', JSON.parse(diff));
    return JSON.parse(diff) as number;
  }
};

export const removeAll = () => {
  storage.clearAll();
};
