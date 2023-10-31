import { Plans, ActivePlans, DefaultPlanId, getActivePlan } from "..";

describe("pricing", () => {
  it("pricing plans exist", async () => {
    expect(Plans).toBeDefined();
    expect(Plans.length).toBeGreaterThan(0);
  });

  it("active pricing plans exist", async () => {
    expect(ActivePlans).toBeDefined();
    expect(ActivePlans.length).toBeGreaterThan(0);
  });

  it("default pricing plan exists", async () => {
    expect(DefaultPlanId).toBeDefined();
    expect(Plans.map((p) => p.planId)).toContain(DefaultPlanId); // does not have to be an active plan
  });

  it("getActivePlan returns undefined for non-existing plan", async () => {
    expect(getActivePlan("idontexist")).toBeUndefined();
  });

  it("getActivePlan returns the plan by Id", async () => {
    expect(getActivePlan(ActivePlans[0].planId)).toMatchObject(ActivePlans[0]);
  });

  it("getPlan returns the plan by Id", async () => {
    expect(getActivePlan(Plans[0].planId)).toMatchObject(Plans[0]);
  });
});
