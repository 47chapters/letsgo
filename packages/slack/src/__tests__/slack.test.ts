import { sendSlackMessage } from "..";

describe("slack", () => {
  it("sendSlackMessage is defined", () => {
    expect(typeof sendSlackMessage).toBe("function");
  });
});
