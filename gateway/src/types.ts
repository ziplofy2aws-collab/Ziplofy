export type SelectedService = 'whatsapp_api' | 'website_builder';
export type IndustryKind = 'ecommerce' | 'service';
export type Destination = 'codiic' | 'webpanel';
export type OnboardingStatus = 'auth' | 'awaiting_choice' | 'provisioning' | 'complete';

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  provider: 'local' | 'google';
  onboardingStatus: OnboardingStatus;
  selectedService: SelectedService | null;
  industryKind: IndustryKind | null;
  industry: string;
  modulesChosen: boolean;
  selectedModules: string[];
  businessName: string;
  destination: Destination | null;
  launchPath: string;
};

export type SsoRedirect = {
  destination: Destination;
  launchPath: string;
  ssoUrl: string;
};

export type SessionResponse = {
  success: boolean;
  token?: string;
  user: PlatformUser;
  nextPath: string | null;
  redirect: SsoRedirect | null;
  message?: string;
};

export type IndustryOption = { id: string; label: string };

export type PanelModule = { id: string; label: string; locked: boolean; kind?: 'core' | 'panel' };
