"use client";

import { Tenant } from "@letsgo/tenant";
import useSWR from "swr";

const CurrentTenantKey = "LetsGoCurrentTenant";

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

export interface UseApiOptions {
  path?: string;
  method?: string;
  body?: any;
  noResponse?: boolean;
}

export function useApi<T>(options: UseApiOptions) {
  const { isLoading, error, data } = useSWR(
    options.path ? `/api/proxy${options.path}` : null,
    async (url) => {
      const method = options.method || "GET";
      const result = await fetch(
        url,
        options.body
          ? {
              method,
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(options.body),
            }
          : {
              method,
            }
      );

      if (!result.ok) {
        throw new Error(
          `Failed to fetch HTTP ${method} ${url}: HTTP ${result.status} ${result.statusText}`
        );
      }

      return options.noResponse ? undefined : result.json();
    }
  );
  return { isLoading, error, data } as {
    isLoading: boolean;
    error: any;
    data?: T;
  };
}
