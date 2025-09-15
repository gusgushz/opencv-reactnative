import AppConfig from './config/app.json';

export enum RoleLevels {
  ZERO = '1',
  ONE = '2',
  TWO = '3',
  THREE = '4',
}

//NOTE
//vifinsa
// export const sufix = 'vif001';
//chiapas
export const sufix = 'CHP003';
//edomex
// export const sufix = 'MEX010';

export const region = AppConfig.Regions[0].Name.toUpperCase();
export const providerId = AppConfig.Provider.Id;

export const stateNameToId = (state: string): number => {
  if (state === region) {
    console.log('Region found:', state === region);
    return parseInt(AppConfig.Regions[0].Id);
  } else {
    return -1;
  }
};
