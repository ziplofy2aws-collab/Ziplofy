export type SelectedService = 'whatsapp_api' | 'website_builder';
export type IndustryKind = 'ecommerce' | 'service';
export type Destination = 'codiic' | 'webpanel';
export type OnboardingStatus = 'auth' | 'awaiting_choice' | 'provisioning' | 'complete';

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  provider: 'local' | 'google';
  emailVerified?: boolean;
  onboardingStatus: OnboardingStatus;
  selectedService: SelectedService | null;
  industryKind: IndustryKind | null;
  industry: string;
  modulesChosen: boolean;
  selectedModules: string[];
  businessName: string;
  profileComplete?: boolean;
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
  needsVerification?: boolean;
  email?: string;
};

export type IndustryOption = { id: string; label: string };

export type PanelModule = { id: string; label: string; locked: boolean; kind?: 'core' | 'panel' };
