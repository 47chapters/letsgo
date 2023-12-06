"use client";

import { useRouter } from "next/navigation";
import { useApiMutate } from "components/common-client";
import { useEffect, useState } from "react";
import { useTenant } from "components/TenantProvider";

export default function Join({
  params: { tenantId, invitationId },
}: {
  params: { tenantId: string; invitationId: string };
}) {
  const {
    isLoading: isLoadingTenants,
    error: tenantError,
    refreshTenants,
    getTenant: getTenantFromTenants,
    setCurrentTenant,
  } = useTenant();
  const router = useRouter();
  const {
    isMutating: isAcceptingInvitation,
    error: acceptingInvitationError,
    trigger: acceptInvitation,
  } = useApiMutate<any>({
    path: `/v1/tenant/${tenantId}/invitation/${invitationId}/accept`,
    method: "POST",
    afterSuccess: async () => {
      setInvitationAccepted(true);
      await refreshTenants();
      // const newTenant = getTenantFromTenants(tenantId);
      // setCurrentTenant(newTenant);
      window.location.href = `/manage/${tenantId}/settings`;
      // router.replace(`/manage/${tenantId}/settings`);
    },
  });
  const [invitationAccepted, setInvitationAccepted] = useState(false);

  useEffect(() => {
    if (
      !isLoadingTenants &&
      !isAcceptingInvitation &&
      !tenantError &&
      !acceptingInvitationError &&
      !invitationAccepted
    ) {
      acceptInvitation();
    }
  }, [
    acceptInvitation,
    isAcceptingInvitation,
    isLoadingTenants,
    tenantError,
    acceptingInvitationError,
    invitationAccepted,
  ]);

  const error = tenantError || acceptingInvitationError;
  if (error) throw error;

  return <div>Accepting invitation...</div>;
}
