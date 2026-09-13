import test from "node:test";
import assert from "node:assert/strict";
import { addDays, addMonths, getBillingStatus } from "../src/utils/billing.js";
test("activation month and grace dates are calculated", () => { const start = new Date("2026-09-12T00:00:00Z"); assert.equal(addMonths(start, 1).toISOString(), "2026-10-12T00:00:00.000Z"); assert.equal(addDays(addMonths(start, 1), 14).toISOString(), "2026-10-26T00:00:00.000Z"); });
test("billing status changes after current period and grace period", () => { const subscription = { currentPeriodEnd: "2026-10-12T00:00:00Z", gracePeriodEndsAt: "2026-10-26T00:00:00Z" }; assert.equal(getBillingStatus(subscription, new Date("2026-10-01")), "active"); assert.equal(getBillingStatus(subscription, new Date("2026-10-20")), "grace_period"); assert.equal(getBillingStatus(subscription, new Date("2026-10-27")), "restricted"); });
