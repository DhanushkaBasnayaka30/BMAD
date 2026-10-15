export interface CanaryServiceResponse {
  status: 'ok';
  timestamp: string;
  source: 'canary-service';
}

export type ActionResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never };

export type CanaryActionResult = ActionResult<CanaryServiceResponse>;

