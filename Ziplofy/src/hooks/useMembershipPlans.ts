import { useCallback, useEffect, useState } from 'react';
import { axiosi } from '../config/axios.config';
import type { MembershipPlan, MembershipPlansResponse } from '../types/membership-plan';

export function useMembershipPlans() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<MembershipPlansResponse>('/membership-plans');
      const data = res.data?.data ?? [];
      setPlans(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load membership plans';
      setError(message);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, loading, error, refetch: fetchPlans };
}
