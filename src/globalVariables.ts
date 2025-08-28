import AppConfig from './config/app.json';

export enum RoleLevels {
  ZERO = '1',
  ONE = '2',
  TWO = '3',
  THREE = '4',
}

export const sufix = 'vif001';
export const region = AppConfig.Regions[0].Name.toUpperCase();

export const stateNameToId = (state: string): number => {
  if (state === region) {
    console.log('Region found:', state === region);
    return parseInt(AppConfig.Regions[0].Id);
  } else {
    return -1;
  }
};
