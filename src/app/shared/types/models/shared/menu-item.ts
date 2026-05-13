export class MenuItem {
  public id: string | undefined;
  public type: 'basic' | 'group' | 'collapsable' | undefined;
  public titleTranslationKey: string | undefined;
  public subtitleTranslationKey?: string;
  public icon?: string;
  public link?: string;
  public children?: MenuItem[];
  public classes?: string | string[] | Record<string, boolean>;
  public exactMatch?: boolean;
  public disabled?: boolean;
  public disabledTooltipTranslationKey?: string;

  public constructor(value: Partial<MenuItem>) {
    Object.assign(this, value);
  }
}
