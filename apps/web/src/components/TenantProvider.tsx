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
  currentTenant?: Tenant;
  tenants?: Tenant[];
  error?: Error;
  isLoading: boolean;
  setCurrentTenant: (tenant?: Tenant) => void;
  getTenant: (tenantId: string) => Tenant | undefined;
  refreshTenants: () => Promise<void>;
};

const missingTenantProvider = "You forgot to wrap your app in <TenantProvider>";

export const TenantContext = createContext<TenantContext>({
  get currentTenant(): never {
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
  setCurrentTenant: (): never => {
    throw new Error(missingTenantProvider);
  },
  getTenant: (): never => {
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
  currentTenant?: Tenant;
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
    currentTenant: undefined,
  });
  let { currentTenant } = state;

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
        if (
          !tenants.find((tenant) => tenant.tenantId === currentTenant?.tenantId)
        ) {
          // The current tenant is not in the list of user's tenants. Set it to the saved tenant
          // or use the first tenant from the list if the saved tenant is not on it.
          const newTenant =
            tenants.find(
              (tenant) => tenant.tenantId === savedCurrentTenantId
            ) || tenants[0];
          setState((state) => ({ ...state, currentTenant: newTenant }));
        }
      } else {
        // The user has no tenants. Clear the current tenant.
        setState((state) => ({ ...state, currentTenant: undefined }));
      }
    },
  });

  const setCurrentTenant = useCallback(
    (tenant?: Tenant) => {
      if (tenant !== currentTenant) {
        if (!me?.tenants) {
          throw new Error("Tenants not yet loaded");
        }
        if (tenant && !me?.tenants?.includes(tenant)) {
          throw new Error(`You don't have access to tenant ${tenant.tenantId}`);
        }
        saveCurrentTenant(tenant?.tenantId);
        setState((state) => ({ ...state, currentTenant: tenant }));
      }
    },
    [currentTenant, me?.tenants]
  );

  const getTenant = useCallback(
    (tenantId: string): Tenant | undefined => {
      return me?.tenants?.find((t) => t.tenantId === tenantId);
    },
    [me?.tenants]
  );

  const value = useMemo(
    () => ({
      isLoading: isMeLoading || isUserLoading,
      error: meError || userError,
      currentTenant,
      tenants: me?.tenants as Tenant[],
      setCurrentTenant,
      getTenant,
      refreshTenants,
    }),
    [
      isMeLoading,
      isUserLoading,
      userError,
      meError,
      currentTenant,
      setCurrentTenant,
      getTenant,
      refreshTenants,
      me?.tenants,
    ]
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}
