"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Tenant } from "@letsgo/tenant";
import React, {
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { loadCurrentTenant, saveCurrentTenant, useApi } from "./common-client";
import { GetMeResponse } from "@letsgo/types";

export type TenantContext = {
  currentTenantId?: string;
  tenants?: Tenant[];
  error?: Error;
  isLoading: boolean;
  setCurrentTenantId: (tenantId?: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
};

const missingTenantProvider = "You forgot to wrap your app in <TenantProvider>";

export const TenantContext = createContext<TenantContext>({
  get currentTenantId(): never {
    throw new Error(missingTenantProvider);
  },
  get tenants(): never {
    throw new Error(missingTenantProvider);
  },
  get error(): never {
    throw new Error(missingTenantProvider);
  },
  get isLoading(): never {
    throw new Error(missingTenantProvider);
  },
  setCurrentTenantId: (): never => {
    throw new Error(missingTenantProvider);
  },
  refreshTenants: (): never => {
    throw new Error(missingTenantProvider);
  },
});

export type UseTenant = () => TenantContext;

export const useTenant: UseTenant = () =>
  useContext<TenantContext>(TenantContext);

type TenantProviderState = {
  currentTenantId?: string;
};

export type TenantProviderProps = React.PropsWithChildren<{
  noTenantProvisioning?: boolean;
}>;

export function TenantProvider({
  children,
  noTenantProvisioning = false,
}: TenantProviderProps): ReactElement<TenantContext> {
  const { isLoading: isUserLoading, error: userError, user } = useUser();

  const [state, setState] = useState<TenantProviderState>({
    currentTenantId: undefined,
  });
  let { currentTenantId } = state;

  const {
    isLoading: isMeLoading,
    error: meError,
    data: me,
    mutate: refreshTenants,
  } = useApi<GetMeResponse>({
    path: user
      ? `/v1/me${noTenantProvisioning ? "?noTenantProvisioning" : ""}`
      : null,
    afterSuccess: async (me) => {
      const savedCurrentTenantId = loadCurrentTenant() || undefined;
      const tenants = me?.tenants as Tenant[];
      if (tenants?.length > 0) {
        if (!tenants.find((tenant) => tenant.tenantId === currentTenantId)) {
          // The current tenant is not in the list of user's tenants. Set it to the saved tenant
          // or use the first tenant from the list if the saved tenant is not on it.
          const newTenantId = tenants.find(
            (tenant) => tenant.tenantId === savedCurrentTenantId
          )
            ? savedCurrentTenantId
            : tenants[0].tenantId;
          setCurrentTenantId(newTenantId);
        }
      } else {
        // The user has no tenants. Clear the current tenant.
        setState((state) => ({ ...state, currentTenantId: undefined }));
      }
    },
  });

  const setCurrentTenantId = useCallback(
    async (tenantId?: string): Promise<void> => {
      if (tenantId !== currentTenantId) {
        saveCurrentTenant(tenantId);
        setState((state) => ({ ...state, currentTenantId: tenantId }));
      }
    },
    [currentTenantId]
  );

  const value = useMemo(
    () => ({
      isLoading: isMeLoading || isUserLoading,
      error: meError || userError,
      currentTenantId,
      tenants: me?.tenants as Tenant[],
      setCurrentTenantId,
      refreshTenants,
    }),
    [
      isMeLoading,
      isUserLoading,
      userError,
      meError,
      currentTenantId,
      setCurrentTenantId,
      refreshTenants,
      me?.tenants,
    ]
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}
