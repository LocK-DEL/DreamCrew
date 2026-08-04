export interface OnboardingActionState {
  errors: Record<string, string>;
}

export const EMPTY_ONBOARDING_STATE: OnboardingActionState = { errors: {} };
