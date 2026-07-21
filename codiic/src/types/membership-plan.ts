export interface MembershipPlanFeature {
  name: string;
  included: boolean;
}

export interface MembershipPlan {
  _id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: MembershipPlanFeature[];
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface MembershipPlansResponse {
  success: boolean;
  data: MembershipPlan[];
  count: number;
}
