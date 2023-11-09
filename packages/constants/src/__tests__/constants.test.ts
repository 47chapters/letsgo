import { DefaultDeployment, DefaultRegion, TagKeys } from "..";

describe("constants", () => {
  it("are defined", () => {
    expect(typeof DefaultDeployment).toBe("string");
    expect(typeof DefaultRegion).toBe("string");
  });
});
