import { Tenant } from "@letsgo/tenant";

const CurrentTenantKey = "LetsGoCurrentTenant";

export function getApiUrl(relativeUrl: string) {
  return `${process.env["LETSGO_API_URL"]}${relativeUrl}`;
}

export function loadCurrentTenant(): string | undefined {
  const currentTenant = localStorage.getItem(CurrentTenantKey) || undefined;
  return currentTenant;
}

export function saveCurrentTenant(tenant?: string) {
  if (tenant === undefined) {
    localStorage.removeItem(CurrentTenantKey);
  } else {
    localStorage.setItem(CurrentTenantKey, tenant);
  }
}

export function sortTenants(tenants: Tenant[]): Tenant[] {
  return tenants.sort((t1, t2) =>
    t1.displayName === t2.displayName
      ? 0
      : t1.displayName < t2.displayName
      ? -1
      : 1
  );
}
