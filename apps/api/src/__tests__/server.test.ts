import "dotenv/config";
import supertest from "supertest";
import { createServer } from "../server";
import { createJwt, TenantIdClaim } from "@letsgo/trust";
import express, { RequestHandler } from "express";
import { authenticate, AuthenticatedRequest } from "../middleware/authenticate";
import { authorizeTenant } from "../middleware/authorizeTenant";

let accessToken: string | undefined = undefined;
const getAccessToken = async () => {
  if (!accessToken) {
    accessToken = await createJwt({ subject: "letsgo:test" });
  }
  return accessToken;
};
let accessTokenWithTenant: string | undefined = undefined;
const testTenantId = "ten-123";
const getAccessTokenWithTenant = async () => {
  if (!accessTokenWithTenant) {
    accessTokenWithTenant = await createJwt({
      subject: "letsgo:test",
      claims: { [TenantIdClaim]: testTenantId },
    });
  }
  return accessTokenWithTenant;
};

const createTestServer = () => {
  const app = express();

  const handler: RequestHandler = (request, response) =>
    response.json({
      params: request.params,
      token: (request as AuthenticatedRequest).user.decodedJwt,
    });

  app.get("/1", authenticate(), handler);
  app.get("/2", authenticate({ useTenantIdFromToken: true }), handler);
  app.get("/3/:tenantId", authenticate(), authorizeTenant(), handler);
  app.get(
    "/3",
    authenticate({ useTenantIdFromToken: true }),
    authorizeTenant(),
    handler
  );

  return app;
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

  it("GET /1 without access token returns 401", async () => {
    await supertest(createTestServer()).get("/1").expect(401);
  });

  it("GET /1 with access token without tenantId claim returns 200", async () => {
    const accessToken = await getAccessToken();
    const res = await supertest(createTestServer())
      .get("/1")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect("Content-Type", /json/);
    expect(res.body).toBeDefined();
    expect(res.body.token?.payload).toMatchObject({ sub: "letsgo:test" });
    expect(res.body.token?.payload[TenantIdClaim]).toBeUndefined();
  });

  it("GET /1 with access token with tenantId claim returns 200", async () => {
    const accessToken = await getAccessTokenWithTenant();
    const res = await supertest(createTestServer())
      .get("/1")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect("Content-Type", /json/);
    expect(res.body).toBeDefined();
    expect(res.body.token?.payload).toMatchObject({
      sub: "letsgo:test",
      [TenantIdClaim]: testTenantId,
    });
    expect(res.body.params?.tenantId).toBeUndefined();
  });

  it("GET /2 with access token without tenantId claim returns 200", async () => {
    const accessToken = await getAccessToken();
    const res = await supertest(createTestServer())
      .get("/2")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect("Content-Type", /json/);
    expect(res.body).toBeDefined();
    expect(res.body.token?.payload).toMatchObject({ sub: "letsgo:test" });
    expect(res.body.token?.payload[TenantIdClaim]).toBeUndefined();
  });

  it("GET /2 with access token with tenantId claim returns 200", async () => {
    const accessToken = await getAccessTokenWithTenant();
    const res = await supertest(createTestServer())
      .get("/2")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect("Content-Type", /json/);
    expect(res.body).toBeDefined();
    expect(res.body.token?.payload).toMatchObject({
      sub: "letsgo:test",
      [TenantIdClaim]: testTenantId,
    });
    expect(res.body.params).toMatchObject({
      tenantId: testTenantId,
    });
  });

  it("GET /3/:tenantId with access token without tenantId claim returns 403", async () => {
    const accessToken = await getAccessToken();
    const res = await supertest(createTestServer())
      .get(`/3/${testTenantId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(403);
  });

  it("GET /3/:tenantId with access token with tenantId claim other than the one in slug returns 403", async () => {
    const accessToken = await getAccessTokenWithTenant();
    const res = await supertest(createTestServer())
      .get(`/3/ten-nonmatching`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(403);
  });

  it("GET /3/:tenantId with access token with tenantId matching the one in slug returns 200", async () => {
    const accessToken = await getAccessTokenWithTenant();
    const res = await supertest(createTestServer())
      .get(`/3/${testTenantId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
  });

  it("GET /3 with access token with tenantId returns 200", async () => {
    const accessToken = await getAccessTokenWithTenant();
    const res = await supertest(createTestServer())
      .get("/3")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect("Content-Type", /json/);
    expect(res.body).toBeDefined();
    expect(res.body.token?.payload).toMatchObject({
      sub: "letsgo:test",
      [TenantIdClaim]: testTenantId,
    });
    expect(res.body.params).toMatchObject({
      tenantId: testTenantId,
    });
  });
});
