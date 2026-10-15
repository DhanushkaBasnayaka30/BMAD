'use client';

import { useQuery } from '@tanstack/react-query';
import { canaryAction } from '@/actions/canary.action';
import type { CanaryServiceResponse } from '@/types';

export function useCanary() {
  return useQuery<CanaryServiceResponse>({
    queryKey: ['canary'],
    queryFn: async () => {
      const result = await canaryAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}
