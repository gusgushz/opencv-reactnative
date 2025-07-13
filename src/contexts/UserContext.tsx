import React, { createContext, useState, PropsWithChildren, useContext, useMemo } from 'react';
import { UserProfile, UserSession } from '../models';
/*
FIXME: Este archivo se usa para guardar el usuario mientras se está dentro de la aplicación
Primero se había planteado así, pero se cambió a usar MMKV para guardar el usuario y la sesión
de forma persistente. 
Para volverlo a usar se tendría que descomentar el export y los imports en los archivos que lo usan.
Estos archivos son: 
- App.tsx
- LoginScreen.tsx
- ProfileScreen.tsx
- HomeScreen.tsx
*/
interface UserContextType {
  userSession: UserSession | null;
  setUserSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider = ({ children }: PropsWithChildren) => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const contextValue = useMemo(
    () => ({
      userSession,
      setUserSession,
      user,
      setUser,
    }),
    [userSession, user],
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

//export { UserProvider, useUserContext };
