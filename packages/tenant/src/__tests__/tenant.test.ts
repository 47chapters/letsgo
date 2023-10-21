import "dotenv/config";
import {
  TenantCategory,
  TenantIdentityCategory,
  IdentityTenantCategory,
  serializeIdentityTenantKey,
  serializeTenantIdentityKey,
  deserializeIdentityTenantKey,
  deserializeTenantIdentityKey,
  createTenant,
  getTenant,
  deleteTenant,
  putTenant,
  getIdentitiesOfTenant,
  getTenantsOfIdentity,
  addIdentityToTenant,
  removeIdentityFromTenant,
} from "..";
import { Identity } from "@letsgo/trust";
import { deleteItem } from "@letsgo/db";

const identity1: Identity = {
  iss: "iss-test-1",
  sub: "sub-test-1",
};
const identity2: Identity = {
  iss: "iss-test-1",
  sub: "sub-test-2",
};
const tenant1 = "ten-test-1";

let tenantsToDelete: string[] = [];

describe("tenant", () => {
  afterEach(async function cleanup() {
    await Promise.all(
      tenantsToDelete.map((id) =>
        Promise.all([
          deleteItem(TenantCategory, id),
          deleteItem(
            TenantIdentityCategory,
            serializeTenantIdentityKey(id, identity1)
          ),
          deleteItem(
            TenantIdentityCategory,
            serializeTenantIdentityKey(id, identity2)
          ),
          deleteItem(
            IdentityTenantCategory,
            serializeIdentityTenantKey(identity1, id)
          ),
          deleteItem(
            IdentityTenantCategory,
            serializeIdentityTenantKey(identity2, id)
          ),
        ])
      )
    );
    tenantsToDelete = [];
  });

  it("serializeIdentityTenantKey roundtrips through deserializeIdentityTenantKey", async () => {
    const key = serializeIdentityTenantKey(identity1, tenant1);
    const [identity, tenant] = deserializeIdentityTenantKey(key);
    expect(identity).toMatchObject(identity1);
    expect(tenant).toBe(tenant1);
  });

  it("serializeTenantIdentityKey roundtrips through deserializeTenantIdentityKey", async () => {
    const key = serializeTenantIdentityKey(tenant1, identity1);
    const [tenant, identity] = deserializeTenantIdentityKey(key);
    expect(identity).toMatchObject(identity1);
    expect(tenant).toBe(tenant1);
  });

  it("createTenant/getTenant works", async () => {
    const tenant = await createTenant({
      creator: identity1,
      displayName: "test",
    });
    tenantsToDelete.push(tenant.tenantId);
    expect(tenant).toBeDefined();
    expect(tenant.category).toBe(TenantCategory);
    expect(tenant.key).toMatch(/^ten-[a-fo0-9]{32}$/);
    expect(tenant.tenantId).toBe(tenant.key);
    expect(tenant.createdBy).toMatchObject(identity1);
    expect(tenant.createdAt).toBeDefined();
    expect(tenant.updatedBy).toMatchObject(identity1);
    expect(tenant.updatedAt).toBeDefined();
    const t2 = await getTenant({ tenantId: tenant.tenantId });
    expect(t2).toMatchObject(tenant);
  });

  it("createTenant/deleteTenant/getTenant returns undefined", async () => {
    const tenant = await createTenant({
      creator: identity1,
      displayName: "test",
    });
    tenantsToDelete.push(tenant.tenantId);
    const deletedTenant = await deleteTenant({
      tenantId: tenant.tenantId,
      deletedBy: identity1,
    });
    expect(deletedTenant).toBeDefined();
    const t2 = await getTenant({ tenantId: tenant.tenantId });
    expect(t2).toBeUndefined();
  });

  it("createTenant/deleteTenant/getTenant(true) returns deleted tenant", async () => {
    const tenant = await createTenant({
      creator: identity1,
      displayName: "test",
    });
    tenantsToDelete.push(tenant.tenantId);
    const deletedTenant = await deleteTenant({
      tenantId: tenant.tenantId,
      deletedBy: identity2,
    });
    expect(deletedTenant).toBeDefined();
    const afterDeleteTenant = await getTenant({
      tenantId: tenant.tenantId,
      includeDeleted: true,
    });
    expect(afterDeleteTenant).toMatchObject(tenant);
    expect(afterDeleteTenant).toMatchObject(deletedTenant as any);
    expect(afterDeleteTenant?.deletedBy).toMatchObject(identity2);
    expect(afterDeleteTenant?.deletedAt).toBeDefined();
  });

  it("createTenant/putTenant/getTenant works", async () => {
    const tenant = await createTenant({
      creator: identity1,
      displayName: "test",
    });
    tenantsToDelete.push(tenant.tenantId);
    const updatedTenant = await putTenant({
      tenantId: tenant.tenantId,
      updatedBy: identity2,
    });
    const afterUpdateTenant = await getTenant({ tenantId: tenant.tenantId });
    expect(afterUpdateTenant?.updatedAt).not.toBe(tenant.updatedAt);
    expect(afterUpdateTenant).toMatchObject(updatedTenant);
    expect(afterUpdateTenant?.updatedBy).toMatchObject(identity2);
    expect(afterUpdateTenant?.updatedAt).toBeDefined();
  });

  it("deleteTenant with non-existing tenant returns undefined", async () => {
    const result = await deleteTenant({
      tenantId: "ten-idontexist",
      deletedBy: identity1,
    });
    expect(result).toBeUndefined();
  });

  it("createTenant/getTenantsOfIdentity works", async () => {
    const tenant = await createTenant({
      creator: identity1,
      displayName: "test",
    });
    tenantsToDelete.push(tenant.tenantId);
    const result = await getTenantsOfIdentity({ identity: identity1 });
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject(tenant);
  });

  it("createTenant/getIdentitiesOfTenant works", async () => {
    const tenant = await createTenant({
      creator: identity2,
      displayName: "test",
    });
    tenantsToDelete.push(tenant.tenantId);
    const result = await getIdentitiesOfTenant({ tenantId: tenant.tenantId });
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject(identity2);
  });

  it("createTenant/addIdentityToTenant/getIdentitiesOfTenant works", async () => {
    const tenant = await createTenant({
      creator: identity1,
      displayName: "test",
    });
    tenantsToDelete.push(tenant.tenantId);
    await addIdentityToTenant({
      tenantId: tenant.tenantId,
      identity: identity2,
    });
    const result = await getIdentitiesOfTenant({ tenantId: tenant.tenantId });
    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0]).toMatchObject(identity1);
    expect(result[1]).toMatchObject(identity2);
  });

  it("createTenant/addIdentityToTenant/getTenantsOfIdentity/getIdentitiesOfTenant works", async () => {
    const tenant1 = await createTenant({
      creator: identity1,
      displayName: "test",
    });
    tenantsToDelete.push(tenant1.tenantId);
    const tenant2 = await createTenant({
      creator: identity2,
      displayName: "test",
    });
    tenantsToDelete.push(tenant2.tenantId);
    await addIdentityToTenant({
      tenantId: tenant1.tenantId,
      identity: identity2,
    });
    let identities = await getIdentitiesOfTenant({
      tenantId: tenant1.tenantId,
    });
    expect(identities).toBeDefined();
    expect(identities.length).toBe(2);
    expect(identities[0]).toMatchObject(identity1);
    expect(identities[1]).toMatchObject(identity2);
    identities = await getIdentitiesOfTenant({ tenantId: tenant2.tenantId });
    expect(identities).toBeDefined();
    expect(identities.length).toBe(1);
    expect(identities[0]).toMatchObject(identity2);
    let tenants = await getTenantsOfIdentity({ identity: identity1 });
    expect(tenants).toBeDefined();
    expect(tenants.length).toBe(1);
    expect(tenants[0]).toMatchObject(tenant1);
    tenants = await getTenantsOfIdentity({ identity: identity2 });
    expect(tenants).toBeDefined();
    expect(tenants.length).toBe(2);
    expect(tenants[0]).toMatchObject(tenant1);
    expect(tenants[1]).toMatchObject(tenant2);
  });

  it("createTenant/removeIdentityFromTenant/getTenantsOfIdentity/getIdentitiesOfTenant works", async () => {
    const tenant1 = await createTenant({
      creator: identity1,
      displayName: "test",
    });
    tenantsToDelete.push(tenant1.tenantId);
    await removeIdentityFromTenant({
      tenantId: tenant1.tenantId,
      identity: identity1,
    });
    let identities = await getIdentitiesOfTenant({
      tenantId: tenant1.tenantId,
    });
    expect(identities).toBeDefined();
    expect(identities.length).toBe(0);
    let tenants = await getTenantsOfIdentity({ identity: identity1 });
    expect(tenants).toBeDefined();
    expect(tenants.length).toBe(0);
  });

  it("createTenant/deleteTenant/getTenantsOfIdentity/getIdentitiesOfTenant works", async () => {
    const tenant1 = await createTenant({
      creator: identity1,
      displayName: "test",
    });
    tenantsToDelete.push(tenant1.tenantId);
    const deletedTenant = await deleteTenant({
      tenantId: tenant1.tenantId,
      deletedBy: identity1,
    });
    let identities = await getIdentitiesOfTenant({
      tenantId: tenant1.tenantId,
    });
    expect(identities).toBeDefined();
    expect(identities.length).toBe(1);
    expect(identities[0]).toMatchObject(identity1);
    let tenants = await getTenantsOfIdentity({ identity: identity1 });
    expect(tenants).toBeDefined();
    expect(tenants.length).toBe(0);
    tenants = await getTenantsOfIdentity({
      identity: identity1,
      includeDeleted: true,
    });
    expect(tenants).toBeDefined();
    expect(tenants.length).toBe(1);
    expect(tenants[0]).toMatchObject(deletedTenant as any);
  });
});
