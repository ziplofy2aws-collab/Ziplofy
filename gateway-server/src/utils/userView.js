function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    provider: user.provider,
    onboardingStatus: user.onboardingStatus,
    selectedService: user.selectedService,
    industryKind: user.industryKind,
    industry: user.industry,
    modulesChosen: Boolean(user.modulesChosen),
    selectedModules: Array.isArray(user.selectedModules) ? user.selectedModules : [],
    businessName: user.businessName,
    destination: user.destination,
    launchPath: user.launchPath,
  };
}

function nextWizardPath(user) {
  if (user.onboardingStatus === 'complete' && user.destination) {
    return null;
  }
  if (!user.industryKind) return '/choose-industry';
  if (!user.businessName) return '/business-name';
  return '/launching';
}

module.exports = { publicUser, nextWizardPath };
