function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    provider: user.provider,
    emailVerified: Boolean(user.emailVerified),
    onboardingStatus: user.onboardingStatus,
    selectedService: user.selectedService,
    industryKind: user.industryKind,
    industry: user.industry,
    modulesChosen: Boolean(user.modulesChosen),
    selectedModules: Array.isArray(user.selectedModules) ? user.selectedModules : [],
    businessName: user.businessName,
    billingTaxId: user.billingTaxId || '',
    billingAddress: user.billingAddress || '',
    preferredTimezone: user.preferredTimezone || '',
    preferredLanguage: user.preferredLanguage || '',
    profileComplete: Boolean(user.profileComplete),
    destination: user.destination,
    launchPath: user.launchPath,
  };
}

/**
 * After email verification, users log in and are SSO'd into CRM.
 * Unverified local users stay on /login (client shows OTP).
 */
function nextWizardPath(user) {
  if (user.provider === 'local' && !user.emailVerified) {
    return '/login';
  }
  // Verified users go to launching / SSO — never null (client must not fall back to /login).
  return '/launching';
}

module.exports = { publicUser, nextWizardPath };
