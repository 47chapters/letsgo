import { handler } from "../index";

describe("worker", () => {
  it("has a handler function", async () => {
    expect(handler).toBeInstanceOf(Function);
  });
});
