"use client";

import useSWR, { KeyedMutator } from "swr";
import useSWRMutate from "swr/mutation";

const CurrentTenantKey = "LetsGoCurrentTenant";

export function createAbsoluteUrl(relativeUrl: string) {
  return `${window.location.protocol}//${window.location.host}${relativeUrl}`;
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

async function createResultNotOkError(
  method: string,
  url: string,
  result: Response
) {
  let details: string | undefined = undefined;
  try {
    details = await result.text();
    const json = JSON.parse(details);
    if (json.message) {
      details = json.message;
    }
  } catch (e) {
    // Ignore
  }
  return new Error(
    `Failed to fetch HTTP ${method} ${url}: HTTP ${result.status} ${
      result.statusText
    }${(details && `. Details: ${details}`) || ""}`
  );
}

export interface UseApiOptions<T> {
  path?: string | null;
  unauthenticated?: boolean;
  afterSuccess?: (result?: T) => Promise<void> | void;
}

export function useApi<T>(options: UseApiOptions<T>) {
  const { isLoading, error, data, mutate } = useSWR(
    options.path
      ? `/api/${options.unauthenticated ? "unauthenticated-proxy" : "proxy"}${
          options.path
        }`
      : null,
    async (url: string) => {
      const result = await fetch(url);

      if (!result.ok) {
        throw await createResultNotOkError("GET", url, result);
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
  unauthenticated?: boolean;
  afterSuccess?: (result?: T) => Promise<void> | void;
}

export function useApiMutate<T>(options: UseApiMutateOptions<T>) {
  const key = `/api/${
    options.unauthenticated ? "unauthenticated-proxy" : "proxy"
  }${options.path}`;
  const { isMutating, error, data, trigger } = useSWRMutate(
    key,
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
        throw await createResultNotOkError(options.method, url, result);
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
