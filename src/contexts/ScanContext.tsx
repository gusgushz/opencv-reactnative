import React, { createContext, useState, PropsWithChildren, useContext, useMemo } from 'react';
import { Parts, PartsEdomex } from '../models';

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
  parts: Parts | null;
  setParts: React.Dispatch<React.SetStateAction<Parts | null>>;
  partsEdomex: PartsEdomex | null;
  setPartsEdomex: React.Dispatch<React.SetStateAction<PartsEdomex | null>>;
}

const ScanContext = createContext<UserContextType | undefined>(undefined);

const ScanContextProvider = ({ children }: PropsWithChildren) => {
  const [parts, setParts] = useState<Parts | null>(null);
  const [partsEdomex, setPartsEdomex] = useState<PartsEdomex | null>(null);

  const contextValue = useMemo(
    () => ({
      parts,
      setParts,
      partsEdomex,
      setPartsEdomex,
    }),
    [parts, partsEdomex],
  );

  return <ScanContext.Provider value={contextValue}>{children}</ScanContext.Provider>;
};

const useScanContext = (): UserContextType => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScanContext must be used within a ScanContextProvider');
  }
  return context;
};

export { ScanContextProvider, useScanContext };
