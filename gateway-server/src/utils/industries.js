const ECOMMERCE_INDUSTRIES = [
  { id: 'fashion', label: 'Fashion & Apparel' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'beauty', label: 'Beauty & Personal Care' },
  { id: 'home', label: 'Home & Decor' },
  { id: 'food', label: 'Food & Grocery' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'sports', label: 'Sports' },
  { id: 'other_ecommerce', label: 'Other ecommerce' },
];

const SERVICE_INDUSTRIES = [
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'education', label: 'Education' },
  { id: 'real_estate', label: 'Real estate' },
  { id: 'agency', label: 'Agency / consulting' },
  { id: 'legal', label: 'Legal' },
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'salon', label: 'Salon / spa' },
  { id: 'other_service', label: 'Other service' },
];

function industryKindFor(industry) {
  if (ECOMMERCE_INDUSTRIES.some((item) => item.id === industry)) return 'ecommerce';
  if (SERVICE_INDUSTRIES.some((item) => item.id === industry)) return 'service';
  return null;
}

function isValidIndustry(industryKind, industry) {
  if (industryKind === 'ecommerce') {
    return ECOMMERCE_INDUSTRIES.some((item) => item.id === industry);
  }
  if (industryKind === 'service') {
    return SERVICE_INDUSTRIES.some((item) => item.id === industry);
  }
  if (industryKind === 'custom') {
    return industry === 'custom';
  }
  return false;
}

module.exports = {
  ECOMMERCE_INDUSTRIES,
  SERVICE_INDUSTRIES,
  industryKindFor,
  isValidIndustry,
};
