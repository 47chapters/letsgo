"use client";

import useSWR, { KeyedMutator } from "swr";
import useSWRMutate from "swr/mutation";

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

export interface UseApiOptions<T> {
  path?: string | null;
  afterSuccess?: (result?: T) => Promise<void> | void;
}

export function useApi<T>(options: UseApiOptions<T>) {
  const { isLoading, error, data, mutate } = useSWR(
    options.path ? `/api/proxy${options.path}` : null,
    async (url) => {
      const result = await fetch(url);

      if (!result.ok) {
        throw new Error(
          `Failed to fetch HTTP GET ${url}: HTTP ${result.status} ${result.statusText}`
        );
      }

      const text = await result.text();
      let output: T | undefined = undefined;
      if (text?.length > 0) {
        try {
          output = JSON.parse(text) as T;
        } catch (e: any) {
          throw new Error(
            `Failed to parse the response of HTTP GET ${url} as JSON: ${e.message}`
          );
        }
      }

      if (options.afterSuccess) {
        await options.afterSuccess(output);
      }

      return output;
    }
  );
  return { isLoading, error, data, mutate } as {
    isLoading: boolean;
    error: any;
    data?: T;
    mutate: KeyedMutator<any>;
  };
}

export interface UseApiMutateOptions<T> {
  path: string;
  method: string;
  afterSuccess?: (result?: T) => Promise<void> | void;
}

export function useApiMutate<T>(options: UseApiMutateOptions<T>) {
  const { isMutating, error, data, trigger } = useSWRMutate(
    `/api/proxy${options.path}`,
    async (url, { arg }: { arg: any }) => {
      const result = await fetch(
        url,
        arg
          ? {
              method: options.method,
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(arg),
            }
          : {
              method: options.method,
            }
      );

      if (!result.ok) {
        throw new Error(
          `Failed to fetch HTTP ${options.method} ${url}: HTTP ${result.status} ${result.statusText}`
        );
      }

      const text = await result.text();
      let output: T | undefined = undefined;
      if (text?.length > 0) {
        try {
          output = JSON.parse(text) as T;
        } catch (e: any) {
          throw new Error(
            `Failed to parse the response of HTTP ${options.method} ${url} as JSON: ${e.message}`
          );
        }
      }

      if (options.afterSuccess) {
        await options.afterSuccess(output);
      }

      return output;
    }
  );
  return { isMutating, error, data, trigger } as {
    isMutating: boolean;
    error: any;
    data?: T;
    trigger: KeyedMutator<any>;
  };
}
