import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** @deprecated remote-themes/ removed — Volt/Bloom packs are not in this repo layout anymore. */
console.warn('patch-volt-pages.mjs: skipped (remote-themes folder removed).');
process.exit(0);

const bloomPages = path.join(__dirname, '../_removed/remote-themes/bloom/src/pages');
const voltPages = path.join(__dirname, '../_removed/remote-themes/volt/src/pages');

const replacements = [
  ['templates.profile.sections.profile_main', 'templates.profile.sections.account_hub'],
  ['profile_main', 'account_hub'],
  ['signed_out', 'signed_out_gate'],
  ['profile_form', 'identity_form'],
  ['save_button', 'persist_action'],
  ['email_field.settings.label', 'email_readout.settings.label'],
  ['email_field.settings.helperText', 'email_readout.settings.hint'],
  ['blocks.email_field', 'blocks.email_readout'],
  ['empty_message', 'gate_message'],
  ['sign_in_button', 'gate_button'],
  ['templates.orders.sections.orders_main', 'templates.orders.sections.order_timeline'],
  ['orders_main', 'order_timeline'],
  ['loading_state', 'loading_pulse'],
  ['empty_state', 'empty_pulse'],
  ['order_card', 'timeline_card'],
  ['order_total_line', 'total_row'],
  ['order_date_line', 'date_row'],
  ['status_line', 'status_row'],
  ['templates.preferences.sections.preferences_main', 'templates.preferences.sections.signal_prefs'],
  ['preferences_main', 'signal_prefs'],
  ['signed_out.settings.message', 'signed_out_gate.settings.message'],
  ['marketing_options', 'channel_toggles'],
  ['email_marketing', 'email_toggle'],
  ['sms_marketing', 'sms_toggle'],
  ['language_field', 'locale_select'],
  ['templates.cart.sections.cart_main', 'templates.cart.sections.cart_drawer'],
  ['cart_main', 'cart_drawer'],
  ['empty_message.settings.emptyTitle', 'empty_copy.settings.title'],
  ['continue_link', 'empty_cta'],
  ['line_items', 'line_list'],
  ['item_actions', 'line_actions'],
  ['cart_summary', 'totals_panel'],
  ['subtotal', 'subtotal_row'],
  ['templates.login.sections.login_main', 'templates.login.sections.auth_gate'],
  ['login_main', 'auth_gate'],
  ['form_fields', 'credential_fields'],
  ['primary_button', 'submit_pulse'],
  ['footer_link', 'alt_route'],
  ['signup_prompt', 'alt_prompt'],
  ['signup_link', 'alt_anchor'],
  ['forgot_password_link', 'forgot_link'],
  ['settings.eyebrow', 'settings.panelTitle'],
  ['settings.title', 'settings.panelTitle'],
  ['settings.subtitle', 'settings.panelSubtitle'],
  ['templates.signup.sections.signup_main', 'templates.signup.sections.auth_register'],
  ['signup_main', 'auth_register'],
  ['first_name_field', 'first_field'],
  ['last_name_field', 'last_field'],
  ['login_prompt', 'alt_prompt'],
  ['login_link', 'alt_anchor'],
  ['templates.forgot_password.sections.forgot_main', 'templates.forgot_password.sections.auth_recover'],
  ['forgot_main', 'auth_recover'],
  ['success_message', 'success_flash'],
  ['back_link', 'back_anchor'],
  ['back_route', 'back_route'],
];

const only = new Set(['ProfilePage.tsx', 'OrdersPage.tsx', 'PreferencesPage.tsx', 'CartPage.tsx']);

for (const file of fs.readdirSync(bloomPages)) {
  if (!file.endsWith('.tsx') || !only.has(file)) continue;
  let src = fs.readFileSync(path.join(bloomPages, file), 'utf8');
  for (const [a, b] of replacements) {
    src = src.split(a).join(b);
  }
  fs.writeFileSync(path.join(voltPages, file), src);
}
console.log('Patched volt pages from bloom');
