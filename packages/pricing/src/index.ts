export interface Plan {
  planId: string;
  active: boolean;
  name: string;
  descripton: string;
  features: string[];
  usesStripe: boolean;
  price?: string;
  actionUrl?: string;
  actionVerb?: string;
}

export const DefaultPlanId: string = "free";

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

export const ActivePlans = Plans.filter((p) => p.active);

export function getActivePlan(planId: string): Plan | undefined {
  return ActivePlans.find((p) => p.planId === planId);
}

export function getPlan(planId: string): Plan | undefined {
  return Plans.find((p) => p.planId === planId);
}
