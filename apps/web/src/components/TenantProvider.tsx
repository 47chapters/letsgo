"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Tenant } from "@letsgo/tenant";
import React, {
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loadCurrentTenant, saveCurrentTenant } from "./common-client";

export type TenantContext = {
  currentTenantId?: string;
  tenants?: Tenant[];
  error?: Error;
  isLoading: boolean;
  setCurrentTenantId: (
    tenantId?: string,
    refreshTenantListFromSession?: boolean
  ) => void;
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
});

export type UseTenant = () => TenantContext;

export const useTenant: UseTenant = () =>
  useContext<TenantContext>(TenantContext);

type TenantProviderState = {
  currentTenantId?: string;
};

export type TenantProviderProps = React.PropsWithChildren<{}>;

export function TenantProvider({
  children,
}: TenantProviderProps): ReactElement<TenantContext> {
  const { isLoading, error, user, checkSession } = useUser();

  const [state, setState] = useState<TenantProviderState>({
    currentTenantId: undefined,
  });
  let { currentTenantId } = state;

  const setCurrentTenantId = useCallback(
    async (
      tenantId?: string,
      refreshTenantListFromSession?: boolean
    ): Promise<void> => {
      if (tenantId !== currentTenantId) {
        // A call to checkSession is needed for the UserProvider to refresh
        // the list of tenants from the session, in case a new tenant was created by the user.
        refreshTenantListFromSession && (await checkSession());
        saveCurrentTenant(tenantId);
        setState((state) => ({ ...state, currentTenantId: tenantId }));
      }
    },
    [checkSession, currentTenantId]
  );

  // This logic needs to run within a useEffect hook because it depends on local storage
  // which is not accessible from server components.
  useEffect(() => {
    const savedCurrentTenantId = loadCurrentTenant() || undefined;
    const tenants = user?.tenants as Tenant[];
    if (tenants) {
      if (!tenants.find((tenant) => tenant.tenantId === currentTenantId)) {
        // The current tenant is not in the list of user's tenants. Set it to the saved tenant
        // or use the first tenant from the list if the saved tenant is not on it.
        const newTenantId = tenants.find(
          (tenant) => tenant.tenantId === savedCurrentTenantId
        )
          ? savedCurrentTenantId
          : tenants[0]?.tenantId;
        setCurrentTenantId(newTenantId);
      }
    } else {
      // The user has not been loaded yet - set current tenant to undefined but do not touch the saved tenant
      setState((state) => ({ ...state, currentTenantId: undefined }));
    }
  }, [user, currentTenantId, setCurrentTenantId]);

  const value = useMemo(
    () => ({
      isLoading,
      error,
      currentTenantId,
      tenants: user?.tenants as Tenant[],
      setCurrentTenantId,
    }),
    [isLoading, error, currentTenantId, setCurrentTenantId, user?.tenants]
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}
