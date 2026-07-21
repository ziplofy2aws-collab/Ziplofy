import {
  readCheckoutGlobalSettings,
  readCheckoutOrderSummaryConfig,
  type CheckoutOrderSummaryConfig,
} from '../settings/checkout-settings.types';
import {
  resolveCheckoutProfilePageAppearance,
  type CheckoutProfilePageAppearance,
} from './checkout-profile-page.utils';

export type CheckoutPageAppearance = CheckoutProfilePageAppearance & {
  orderSummaryConfig: Required<CheckoutOrderSummaryConfig>;
  inputFieldsTransparent: boolean;
  addressAutocompletion: boolean;
};

export function resolveCheckoutPageAppearance(
  checkoutConfig: Record<string, unknown> | null | undefined
): CheckoutPageAppearance {
  const global = readCheckoutGlobalSettings(checkoutConfig);
  return {
    ...resolveCheckoutProfilePageAppearance(checkoutConfig),
    orderSummaryConfig: readCheckoutOrderSummaryConfig(checkoutConfig),
    inputFieldsTransparent: global.inputFieldsTransparent,
    addressAutocompletion: global.addressAutocompletion,
  };
}
