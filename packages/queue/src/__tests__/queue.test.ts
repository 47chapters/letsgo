import "dotenv/config";
import { enqueue } from "..";

describe("queue", () => {
  it("enqueue exists", async () => {
    expect(enqueue).toBeDefined();
  });

  it("enqueue works", async () => {
    const result = await enqueue({ enqueue: "test" });
    expect(result).toBeDefined();
    expect(result.messageId).toBeDefined();
  });
});
