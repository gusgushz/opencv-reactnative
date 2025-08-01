export enum RoleLevels {
  ZERO = '1',
  ONE = '2',
  TWO = '3',
  THREE = '4',
}

export const sufix = 'MEX010';
export const isDemo = false;

const regions: string[] = [
  'AGUASCALIENTES',
  'BAJA CALIFORNIA',
  'BAJA CALIFORNIA SUR',
  'CAMPECHE',
  'CHIAPAS',
  'CHIHUAHUA',
  'CIUDAD DE MEXICO',
  'COAHUILA',
  'COLIMA',
  'DURANGO',
  'GUANAJUATO',
  'GUERRERO',
  'HIDALGO',
  'JALISCO',
  'MEXICO',
  'MICHOACAN',
  'MORELOS',
  'NAYARIT',
  'NUEVO LEON',
  'OAXACA',
  'PUEBLA',
  'QUERETARO',
  'QUINTANA ROO',
  'SAN LUIS POTOSI',
  'SINALOA',
  'SONORA',
  'TABASCO',
  'TAMAULIPAS',
  'TLAXCALA',
  'VERACRUZ',
  'YUCATAN',
  'ZACATECAS',
  'BELIZE',
  'CAYO',
  'COROZAL',
  'ORANGE WALK',
  'STANN CREEK',
  'TOLEDO',
];

export const stateNameToId = (state: string): number => {
  const region = regions.findIndex(region => region === state) ?? -1;
  console.log('region(stateId)', region);
  return region;
};
