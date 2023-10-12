import { DefaultDeployment, DefaultRegion, TagKeys } from "..";

describe("constants", () => {
  it("are defined", () => {
    expect(DefaultDeployment).toBeInstanceOf(String);
    expect(DefaultRegion).toBeInstanceOf(String);
    expect(TagKeys).toBeInstanceOf(Object);
  });
});
