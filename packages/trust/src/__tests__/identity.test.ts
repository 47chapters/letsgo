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
  getIdentity,
  putIdentity,
  deleteIdentity,
} from "..";

const identity1 = {
  iss: "iss-test-1",
  sub: "sub-test-1",
};

describe("identity", () => {
  async function cleanup() {
    await deleteIdentity({ identity: identity1 });
  }

  beforeAll(cleanup);
  afterEach(cleanup);

  it("getIdentity returns undefined for non-existing identity", async () => {
    let result = await getIdentity({ identityId: "idn-idontexist" });
    expect(result).toBeUndefined();
    result = await getIdentity({
      identity: { iss: "iss-idontexist", sub: "sub-idontexist" },
    });
    expect(result).toBeUndefined();
  });

  it("putIdentity/getIdentity roundtrips data", async () => {
    const user = { name: "test", email: "email" };
    await putIdentity({ identity: identity1, user });
    let result = await getIdentity({ identity: identity1 });
    expect(result).toBeDefined();
    expect(result?.category).toBeDefined();
    expect(result?.key).toBeDefined();
    expect(result?.identityId).toBeDefined();
    expect(result).toMatchObject({ user });
  });

  it("putIdentity/deleteIdentity/getIdentity returns undefined", async () => {
    const user = { name: "test", email: "email" };
    await putIdentity({ identity: identity1, user });
    await deleteIdentity({ identity: identity1 });
    let result = await getIdentity({ identity: identity1 });
    expect(result).toBeUndefined();
  });
});
