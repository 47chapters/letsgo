import "dotenv/config";
import supertest from "supertest";
import { createServer } from "../server";
import { createJwt } from "@letsgo/trust";

let accessToken: string | undefined = undefined;
const getAccessToken = async () => {
  if (!accessToken) {
    accessToken = await createJwt({ subject: "letsgo:test" });
  }
  return accessToken;
};

describe("api", () => {
  it("GET /v1/health returns 200", async () => {
    const res = await supertest(createServer()).get("/v1/health").expect(200);
    expect(res.body.ok).toBe(true);
  });

  it("GET /v1/me without access token returns 401", async () => {
    await supertest(createServer()).get("/v1/me").expect(401);
  });

  it("GET /v1/me with access token returns 200", async () => {
    const accessToken = await getAccessToken();
    const res = await supertest(createServer())
      .get("/v1/me?noTenantProvisioning")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect("Content-Type", /json/);
    expect(res.body).toBeDefined();
    expect(res.body.identity).toMatchObject({ sub: "letsgo:test" });
    expect(Array.isArray(res.body.tenants)).toBe(true);
    expect(res.body.tenants.length).toBe(0);
    expect(res.body.identityId).toMatch(/^idn-/);
  });
});
