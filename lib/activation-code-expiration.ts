const TRIAL_DURATION_DAYS = 3;
const REGULAR_DURATION_DAYS = 3650;
const DAY_IN_MS = 86400000;

export function getActivationDurationDays(codeOrType?: string) {
  return codeOrType === "trial" || codeOrType?.startsWith("ZYR")
    ? TRIAL_DURATION_DAYS
    : REGULAR_DURATION_DAYS;
}

export function getActivationExpiresAt(startDate: Date, codeOrType?: string) {
  return new Date(startDate.getTime() + getActivationDurationDays(codeOrType) * DAY_IN_MS);
}
