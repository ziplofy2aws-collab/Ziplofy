/** Informatic theme policy templates (web panel Policies area, excluding shipping). */
export const INFORMATIC_POLICY_TEMPLATE_IDS = [
  'privacy',
  'terms',
  'return_refund',
  'contact_info',
] as const;

export type InformaticPolicyTemplateId = (typeof INFORMATIC_POLICY_TEMPLATE_IDS)[number];

export type InformaticStorePolicyApiType = 'return-refund' | 'privacy' | 'terms' | 'contact';

export const INFORMATIC_POLICY_PAGES: Array<{
  id: InformaticPolicyTemplateId;
  label: string;
  route: string;
  policyType: InformaticStorePolicyApiType;
}> = [
  { id: 'privacy', label: 'Privacy policy', route: '/privacy', policyType: 'privacy' },
  { id: 'terms', label: 'Terms of service', route: '/terms', policyType: 'terms' },
  {
    id: 'return_refund',
    label: 'Return and refund policy',
    route: '/return-refund',
    policyType: 'return-refund',
  },
  {
    id: 'contact_info',
    label: 'Contact information',
    route: '/contact-information',
    policyType: 'contact',
  },
];

export function isInformaticPolicyTemplateId(id: string): id is InformaticPolicyTemplateId {
  return (INFORMATIC_POLICY_TEMPLATE_IDS as readonly string[]).includes(id);
}

export function policyTemplateIdToApiType(
  templateId: InformaticPolicyTemplateId
): InformaticStorePolicyApiType {
  return INFORMATIC_POLICY_PAGES.find((p) => p.id === templateId)!.policyType;
}

export function policyPageLabel(templateId: InformaticPolicyTemplateId): string {
  return INFORMATIC_POLICY_PAGES.find((p) => p.id === templateId)?.label ?? templateId;
}
