import "dotenv/config";
import {
  DefaultRegion,
  DefaultDeployment,
  StaticJwtAudience,
} from "@letsgo/constants";
import {
  getActiveIssuer,
  isPkiIssuer,
  createJwt,
  PkiIssuer,
  verifyJwt,
  serializeIdentity,
  deserializeIdentity,
} from "..";
import { JwtPayload, decode } from "jsonwebtoken";

let issuer: PkiIssuer;

describe("trust", () => {
  beforeAll(async () => {
    issuer = (await getActiveIssuer()) as PkiIssuer;
  });

  it("serializeIdentity roundtrips through deserializeIdentity", async () => {
    const identity = {
      iss: "iss-test-1",
      sub: "sub-test-1",
    };
    const serialized = serializeIdentity(identity);
    expect(serialized).toBeDefined();
    const deserialized = deserializeIdentity(serialized);
    expect(deserialized).toMatchObject(identity);
  });

  it("getActiveIssuer returns a PKI issuer", async () => {
    expect(issuer).toBeDefined();
    expect(isPkiIssuer(issuer)).toBe(true);
  });

  it("createJwt returns JWT", async () => {
    const token = await createJwt({
      issuer,
      audience: "test",
      expiresIn: "1h",
    });
    expect(token).toBeDefined();
    const decodedJwt = decode(token, { json: true, complete: true });
    expect(decodedJwt).toBeDefined();
    expect((decodedJwt?.payload as JwtPayload).iss).toBe(issuer.key);
    expect((decodedJwt?.payload as JwtPayload).sub).toBe(issuer.key);
    expect((decodedJwt?.payload as JwtPayload).aud).toBe("test");
    expect((decodedJwt?.payload as JwtPayload).exp).toBeLessThanOrEqual(
      Math.floor(Date.now() / 1000) + 3600
    );
    expect(decodedJwt?.header.alg).toBe("RS256");
    expect(decodedJwt?.header.kid).toBe(issuer.kid);
    expect(decodedJwt?.header.typ).toBe("JWT");
  });

  it("verifyJwt succeeds with JWT created with createJwt", async () => {
    const token = await createJwt({
      issuer,
      audience: "test",
      expiresIn: "1h",
    });
    const decodedJwt = await verifyJwt(
      DefaultRegion,
      DefaultDeployment,
      token,
      "test"
    );
    expect(decodedJwt).toBeDefined();
    expect((decodedJwt?.payload as JwtPayload).iss).toBe(issuer.key);
    expect((decodedJwt?.payload as JwtPayload).sub).toBe(issuer.key);
    expect((decodedJwt?.payload as JwtPayload).aud).toBe("test");
    expect((decodedJwt?.payload as JwtPayload).exp).toBeLessThanOrEqual(
      Math.floor(Date.now() / 1000) + 3600
    );
    expect(decodedJwt?.header.alg).toBe("RS256");
    expect(decodedJwt?.header.kid).toBe(issuer.kid);
    expect(decodedJwt?.header.typ).toBe("JWT");
  });

  it("verifyJwt succeeds with JWT created with createJwt using all defaults", async () => {
    const token = await createJwt();
    const decodedJwt = await verifyJwt(
      DefaultRegion,
      DefaultDeployment,
      token,
      StaticJwtAudience
    );
    expect(decodedJwt).toBeDefined();
    expect((decodedJwt?.payload as JwtPayload).iss).toBe(issuer.key);
    expect((decodedJwt?.payload as JwtPayload).sub).toBe(issuer.key);
    expect((decodedJwt?.payload as JwtPayload).aud).toBe(StaticJwtAudience);
    expect((decodedJwt?.payload as JwtPayload).exp).toBeLessThanOrEqual(
      Math.floor(Date.now() / 1000) + 3600 * 8
    );
    expect(decodedJwt?.header.alg).toBe("RS256");
    expect(decodedJwt?.header.kid).toBe(issuer.kid);
    expect(decodedJwt?.header.typ).toBe("JWT");
  });

  it("verifyJwt succeeds with non-expiring JWT created with createJwt", async () => {
    const token = await createJwt({ expiresIn: "0" });
    const decodedJwt = await verifyJwt(
      DefaultRegion,
      DefaultDeployment,
      token,
      StaticJwtAudience
    );
    expect(decodedJwt).toBeDefined();
    expect((decodedJwt?.payload as JwtPayload).iss).toBe(issuer.key);
    expect((decodedJwt?.payload as JwtPayload).sub).toBe(issuer.key);
    expect((decodedJwt?.payload as JwtPayload).aud).toBe(StaticJwtAudience);
    expect((decodedJwt?.payload as JwtPayload).exp).toBeUndefined();
    expect(decodedJwt?.header.alg).toBe("RS256");
    expect(decodedJwt?.header.kid).toBe(issuer.kid);
    expect(decodedJwt?.header.typ).toBe("JWT");
  });

  it("verifyJwt fails with wrong audience", async () => {
    const token = await createJwt({
      issuer,
      audience: "test1",
      expiresIn: "1h",
    });
    const decodedJwt = await verifyJwt(
      DefaultRegion,
      DefaultDeployment,
      token,
      "test2"
    );
    expect(decodedJwt).toBeUndefined();
  });

  it("verifyJwt fails with expired token", async () => {
    const token = await createJwt({
      issuer,
      audience: "test",
      expiresIn: "1",
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const decodedJwt = await verifyJwt(
      DefaultRegion,
      DefaultDeployment,
      token,
      "test"
    );
    expect(decodedJwt).toBeUndefined();
  });

  it("verifyJwt fails with kid that does not resolve to a key", async () => {
    const issuer1 = { ...issuer, kid: "idontexist" };
    const token = await createJwt({
      issuer: issuer1,
      audience: "test",
      expiresIn: "1",
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const decodedJwt = await verifyJwt(
      DefaultRegion,
      DefaultDeployment,
      token,
      "test"
    );
    expect(decodedJwt).toBeUndefined();
  });

  it("verifyJwt fails with iss that is not trusted", async () => {
    const issuer1 = { ...issuer, key: "idontexist" };
    const token = await createJwt({
      issuer: issuer1,
      audience: "test",
      expiresIn: "1",
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const decodedJwt = await verifyJwt(
      DefaultRegion,
      DefaultDeployment,
      token,
      "test"
    );
    expect(decodedJwt).toBeUndefined();
  });
});
