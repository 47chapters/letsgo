/**
 * This package defines the pricing plans of your app.
 *
 * @module
 */

/**
 * A pricing plan
 */
export interface Plan {
  /**
   * Unique identifier of the plan. Never reuse plan Id values.
   */
  planId: string;
  /**
   * If false, the plan is not available for selection when signing up or switching plans. Set this to false
   * if you want to discontinue a plan. Never remove a plan that has any active tenants using it.
   */
  active: boolean;
  /**
   * Brief, friendly name of the plan.
   */
  name: string;
  /**
   * Brief description of the plan.
   */
  descripton: string;
  /**
   * "Bullet points" list of features of the plan.
   */
  features: string[];
  /**
   * If true, this is a paid plan that should be handled by Stripe subscriptions.
   */
  usesStripe: boolean;
  /**
   * Textual description of the price of the plan, e.g. "$10 / month"
   */
  price?: string;
  /**
   * A URL the user should be redirected to if they select this plan. This may be used for custom plans that
   * require a sales person to contact the user. In that case the the URL maybe a _mailto:_ link or a link
   * the contact form of the website.
   */
  actionUrl?: string;
  /**
   * The verb to use in the action button for the plan, e.g. "Contact Us" or "Buy Now".
   */
  actionVerb?: string;
}

/**
 * The default plan Id to use for all new tenants. This is typically a freemium plan.
 */
export const DefaultPlanId: string = "free";

/**
 * The list of all plans, active and non-active. Never remove a plan from this list that has any active tenants using it,
 * even if you no longer offer this plan to new users. Mark it as `active: false` instead.
 */
export const Plans: Plan[] = [
  {
    planId: "free",
    active: true,
    name: "Free",
    descripton: "Development",
    features: ["2 blips / second", "10 blaps", "Community support"],
    usesStripe: false,
    price: "free forever",
  },
  {
    planId: "starter",
    active: true,
    name: "Starter",
    descripton: "Get going",
    features: ["10 blips / second", "200 blaps", "Community support"],
    usesStripe: true,
    price: "$10 / month",
  },
  {
    planId: "business",
    active: true,
    name: "Business",
    descripton: "Enable growth",
    features: [
      "100 blips / second",
      "5000 blaps",
      "Support Center",
      "Integrations",
    ],
    usesStripe: true,
    price: "$90 / month",
  },
  {
    planId: "custom",
    active: true,
    name: "Contact Us",
    descripton: "White glove treatment",
    features: [
      "Custom blips / second",
      "Custom blaps",
      "Premium support",
      "Integrations",
      "Data residency",
      "SLA",
    ],
    usesStripe: false,
    actionUrl: "/contact",
    actionVerb: "Contact Us",
    price: "custom contract",
  },
];

/**
 * The list of active plans only.
 */
export const ActivePlans = Plans.filter((p) => p.active);

/**
 * Gets an active plan by Id.
 * @param planId The plan Id
 * @returns The plan if it exists and is active, undefined otherwise.
 */
export function getActivePlan(planId: string): Plan | undefined {
  return ActivePlans.find((p) => p.planId === planId);
}

/**
 * Gets a plan by Id.
 * @param planId The plan Id
 * @returns The plan or undefined if it does not exist.
 */
export function getPlan(planId: string): Plan | undefined {
  return Plans.find((p) => p.planId === planId);
}
