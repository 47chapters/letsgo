import { Tenant } from "@letsgo/tenant";

export function sortTenants(tenants: Tenant[]): Tenant[] {
  return tenants.sort((t1, t2) =>
    t1.displayName === t2.displayName
      ? 0
      : t1.displayName < t2.displayName
      ? -1
      : 1
  );
}
