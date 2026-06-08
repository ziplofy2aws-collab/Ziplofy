import { cfgBool, cfgNumber } from '../../runtime/shared/config';

export type FeaturedProductBuyButtonsStyle = {
  alwaysStackButtons: boolean;
  showPickupAvailability: boolean;
  giftCardForm: boolean;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export function readFeaturedProductBuyButtonsStyle(
  config: Record<string, unknown> | null,
  settingsBase: string
): FeaturedProductBuyButtonsStyle {
  return {
    alwaysStackButtons: cfgBool(config, `${settingsBase}.alwaysStackButtons`, false),
    showPickupAvailability: cfgBool(config, `${settingsBase}.showPickupAvailability`, true),
    giftCardForm: cfgBool(config, `${settingsBase}.giftCardForm`, true),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.paddingRight`, 0),
  };
}
