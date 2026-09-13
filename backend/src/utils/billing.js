export const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
};

export function getBillingStatus(subscription, now = new Date()) {
  if (!subscription?.currentPeriodEnd) return "pending_payment";
  if (now <= new Date(subscription.currentPeriodEnd)) return "active";
  if (subscription.gracePeriodEndsAt && now <= new Date(subscription.gracePeriodEndsAt)) return "grace_period";
  return "restricted";
}
