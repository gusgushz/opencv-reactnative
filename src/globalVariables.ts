import AppConfig from './config/app.json';

export enum RoleLevels {
  ZERO = '1',
  ONE = '2',
  TWO = '3',
  THREE = '4',
}

//NOTE
//vifinsa
export const sufix = 'vif001';
//chiapas
// export const sufix = 'CHP004';
//edomex
// export const sufix = 'MEX010';
//demo
// export const sufix = 'dem001';
//plaresa
// export const sufix = 'pls001';
//troqmex
// export const sufix = 'trm001';
//safetyp
// export const sufix = 'sft001';
//vfi
// export const sufix = 'vfi001';

export const isDemo = false; //SOLO CAMBIAR CUANDO SE CREE UNA APP DEMO
export const region = AppConfig.Regions[0].Name.toUpperCase();
export const regionId = AppConfig.Regions[0].Id;
export const provider = AppConfig.Provider.Name.toLowerCase();
export const providerId = AppConfig.Provider.Id;
export const logo = () => {
  if (provider == 'vifinsa' && region == 'YUCATAN') return require('../assets/images/logoHome-vifinsa.png');
  if (provider == 'vifinsa' && region == 'MEXICO') return require('../assets/images/logoHome-edomex.png');
  return require('../assets/logo.png');
};

export const stateNameToId = (state: string): number => {
  if (state === region) {
    console.log('Region found:', state === region);
    return parseInt(AppConfig.Regions[0].Id);
  } else {
    return -1;
  }
};

//prettier-ignore
export const regions = ['','AGUASCALIENTES', 'BAJA CALIFORNIA', 'BAJA CALIFORNIA SUR', 'CAMPECHE', 'CHIAPAS', 'CHIHUAHUA', 'CIUDAD DE MEXICO', 'COAHUILA', 'COLIMA', 'DURANGO', 'GUANAJUATO', 'GUERRERO', 'HIDALGO', 'JALISCO', 'MEXICO', 'MICHOACAN', 'MORELOS', 'NAYARIT', 'NUEVO LEON', 'OAXACA', 'PUEBLA', 'QUERETARO', 'QUINTANA ROO', 'SAN LUIS POTOSI', 'SINALOA', 'SONORA', 'TABASCO', 'TAMAULIPAS', 'TLAXCALA', 'VERACRUZ', 'YUCATAN', 'ZACATECAS', 'BELIZE', 'CAYO', 'COROZAL', 'ORANGE WALK', 'STANN CREEK', 'TOLEDO'];
