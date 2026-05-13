import { Language } from '@app/shared/types/enums/language.type';
import { DropdownItem } from '@app/shared/types/models/shared/dropdown-item';

export const AvailableLanguagesOptions: DropdownItem<Language>[] = [
  {
    value: Language.EN,
    label: 'EN',
    iconName: 'US'
  },
  {
    value: Language.DA,
    label: 'DA',
    iconName: 'DK'
  },
  {
    value: Language.HU,
    label: 'HU',
    iconName: 'HU'
  },
  {
    value: Language.LT,
    label: 'LT',
    iconName: 'LT'
  },
  {
    value: Language.LV,
    label: 'LV',
    iconName: 'LV'
  },
  {
    value: Language.NB,
    label: 'NB',
    iconName: 'NO'
  },
  {
    value: Language.PL,
    label: 'PL',
    iconName: 'PL'
  },
  {
    value: Language.RU,
    label: 'RU',
    iconName: 'RU'
  },
  {
    value: Language.SQ,
    label: 'SQ',
    iconName: 'AL'
  },
  {
    value: Language.SV,
    label: 'SV',
    iconName: 'SE'
  },
  {
    value: Language.TR,
    label: 'TR',
    iconName: 'TR'
  },
  {
    value: Language.UK,
    label: 'UK',
    iconName: 'UA'
  }
];
