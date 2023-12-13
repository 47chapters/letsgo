"use client";

import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";

import { Button } from "components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "components/ui/popover";
import { cn } from "components/utils";
import { Loader2, Factory } from "lucide-react";

import { Tenant } from "@letsgo/tenant";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useTenant } from "./TenantProvider";
import { useApiMutate } from "./common-client";

const createValue = "create";

export interface TenantSelectorProps {
  allowCreate?: boolean;
}

export function TenantSelector({ allowCreate = false }: TenantSelectorProps) {
  const [open, setOpen] = useState(false);
  const {
    isLoading: isTenantLoading,
    error: tenantsError,
    currentTenant,
    tenants,
    refreshTenants,
  } = useTenant();
  const router = useRouter();
  const {
    isMutating: isCreatingTenant,
    error: errorCreatingTenant,
    trigger: createTenant,
    data: newTenant,
  } = useApiMutate<Tenant>({
    path: `/v1/tenant`,
    method: "POST",
    afterSuccess: async (newTenant) => {
      if (newTenant) {
        await refreshTenants();
        router.push(`/manage/${newTenant.tenantId}/dashboard`);
      }
    },
  });

  const handleTenantChange = useCallback(
    async (tenantId: string) => {
      if (tenantId === createValue) {
        createTenant();
      } else {
        router.push(`/manage/${tenantId}/dashboard`);
      }
    },
    [createTenant, router]
  );

  const error = tenantsError || errorCreatingTenant;
  if (error) throw error;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={isTenantLoading || isCreatingTenant}
          aria-expanded={open}
          aria-label="Select a tenant"
          className={cn(
            "w-[250px] overflow-hidden",
            isTenantLoading || isCreatingTenant
              ? "justify-start"
              : "justify-between"
          )}
        >
          <div className="flex mr-2">
            {(isTenantLoading || isCreatingTenant) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isTenantLoading ? (
              "Loading tenants..."
            ) : isCreatingTenant ? (
              "Creating tenant..."
            ) : (
              <>
                <Factory className="ml-auto mr-2 h-4 w-4 shrink-0 opacity-50" />
                {currentTenant?.displayName}
              </>
            )}
          </div>
          {!isTenantLoading && !isCreatingTenant && (
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      {tenants && (
        <PopoverContent className="w-[250px] overflow-hidden p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search tenants..." />
              <CommandEmpty>No tenant found.</CommandEmpty>
              <CommandGroup heading={"Tenants"}>
                {tenants.map((tenant) => (
                  <CommandItem
                    key={tenant.tenantId}
                    onSelect={() => {
                      handleTenantChange(tenant.tenantId);
                      setOpen(false);
                    }}
                    className="text-sm"
                  >
                    <div className="flex">
                      <Factory className="ml-auto mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <span className="whitespace-nowrap">
                        {tenant.displayName}
                      </span>
                    </div>
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        currentTenant?.tenantId === tenant.tenantId
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {allowCreate && (
              <div>
                <CommandSeparator />
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        handleTenantChange(createValue);
                      }}
                    >
                      <PlusCircledIcon className="mr-2 h-5 w-5" />
                      Create Tenant
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </div>
            )}
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}
