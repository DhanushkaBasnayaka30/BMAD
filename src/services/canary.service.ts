import 'server-only';

import type { CanaryServiceResponse } from '@/types';

export async function canaryService(): Promise<CanaryServiceResponse> {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    source: 'canary-service',
  };
}
