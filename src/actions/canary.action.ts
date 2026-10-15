'use server';

import { canaryService } from '@/services/canary.service';
import type { CanaryActionResult } from '@/types';

export async function canaryAction(): Promise<CanaryActionResult> {
  try {
    const data = await canaryService();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown canary error',
    };
  }
}
