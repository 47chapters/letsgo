"use client";

import { Tenant } from "@letsgo/tenant";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "./ConfirmDialog";

export interface DeleteTenantProps {
  tenant: Tenant;
  onDeleteTenant: () => Promise<void>;
}

export function DeleteTenant({ tenant, onDeleteTenant }: DeleteTenantProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danger zone</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <ConfirmDialog
            title="Delete tenant?"
            description={`Are you sure you want to delete tenant ${
              tenant.displayName || tenant.tenantId
            }? All tenant data will be permanently removed. This operation cannot be undone.`}
            trigger={<Button variant="destructive">Delete tenant</Button>}
            confirm={<Button variant="destructive">Delete</Button>}
            onConfirm={onDeleteTenant}
          />
        </div>
      </CardContent>
    </Card>
  );
}
