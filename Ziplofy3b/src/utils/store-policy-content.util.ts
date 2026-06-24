/** True when policy text/HTML has visible content (not blank or empty rich-text blocks). */
export function hasMeaningfulPolicyContent(content: string | undefined | null): boolean {
  if (!content || !content.trim()) return false;
  const stripped = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim();
  return stripped.length > 0;
}

export type StorefrontPolicyTypeKey = 'return-refund' | 'privacy' | 'terms' | 'shipping' | 'contact';

export const STOREFRONT_POLICY_TYPES: StorefrontPolicyTypeKey[] = [
  'return-refund',
  'privacy',
  'terms',
  'shipping',
  'contact',
];

export function isStorefrontPolicyType(value: string): value is StorefrontPolicyTypeKey {
  return (STOREFRONT_POLICY_TYPES as string[]).includes(value);
}
