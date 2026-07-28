export type Region = 'kr' | 'jp' | 'na' | 'euw' | 'eune' | 'oce';

export interface RegionOption {
  id: Region;
  name: string;
  fullName: string;
  flag: string;
  platformRoute: string;
  regionalRoute: string;
  defaultTag: string;
}

export const REGION_OPTIONS: RegionOption[] = [
  {
    id: 'kr',
    name: 'KR',
    fullName: 'Korea',
    flag: '🇰🇷',
    platformRoute: '/riot-kr',
    regionalRoute: '/riot-asia',
    defaultTag: 'KR1',
  },
  {
    id: 'jp',
    name: 'JP',
    fullName: 'Japan',
    flag: '🇯🇵',
    platformRoute: '/riot-jp',
    regionalRoute: '/riot-asia',
    defaultTag: 'JP1',
  },
  {
    id: 'na',
    name: 'NA',
    fullName: 'North America',
    flag: '🇺🇸',
    platformRoute: '/riot-na',
    regionalRoute: '/riot-americas',
    defaultTag: 'NA1',
  },
  {
    id: 'euw',
    name: 'EUW',
    fullName: 'Europe West',
    flag: '🇪🇺',
    platformRoute: '/riot-euw',
    regionalRoute: '/riot-europe',
    defaultTag: 'EUW',
  },
  {
    id: 'eune',
    name: 'EUNE',
    fullName: 'Europe Nordic & East',
    flag: '🇪🇺',
    platformRoute: '/riot-eune',
    regionalRoute: '/riot-europe',
    defaultTag: 'EUN1',
  },
  {
    id: 'oce',
    name: 'OCE',
    fullName: 'Oceania',
    flag: '🇦🇺',
    platformRoute: '/riot-oce',
    regionalRoute: '/riot-sea',
    defaultTag: 'OCE',
  },
];

export function getRegionOption(id: Region): RegionOption {
  return REGION_OPTIONS.find((r) => r.id === id) || REGION_OPTIONS[0];
}
