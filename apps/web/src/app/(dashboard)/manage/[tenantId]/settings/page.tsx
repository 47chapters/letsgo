"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Invitation } from "@letsgo/tenant";
import { GetInvitationsResponse, GetTenantUsersResponse } from "@letsgo/types";
import { CSSProperties, useEffect, useState } from "react";
import { useApi, useApiMutate } from "../../../../../components/common-client";
import { useTenant } from "../../../../../components/TenantProvider";
import { getPlan } from "@letsgo/pricing";
import { useRouter } from "next/navigation";

const style: CSSProperties = {
  border: "1px solid black",
  borderCollapse: "collapse",
  padding: "0.5em",
};

interface AccountProps {
  tenantId: string;
}

function Account({ tenantId }: AccountProps) {
  const router = useRouter();
  const {
    isLoading,
    error: tenantError,
    currentTenant,
    refreshTenants,
  } = useTenant();
  const [confirmDeleteTenant, setConfirmDeleteTenant] = useState(false);
  const {
    isMutating: isDeletingTenant,
    error: errorDeletingTenant,
    trigger: deleteTenant,
  } = useApiMutate<void>({
    path: `/v1/tenant/${tenantId}`,
    method: "DELETE",
    afterSuccess: async () => {
      window.location.href = "/manage";
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isDeletingTenant) return <div>Deleting...</div>;
  const error = tenantError || errorDeletingTenant;
  if (error) throw error;

  const plan = getPlan(currentTenant?.plan.planId || "");
  const isStripePlan = plan?.usesStripe;

  const handleChangePlan = async () => {
    router.push(`/manage/${tenantId}/newplan`);
  };

  const handleChangePaymentMethod = async () => {
    router.push(`/manage/${tenantId}/paymentmethod`);
  };

  const handleDelete = async () => {
    if (!confirmDeleteTenant) {
      setConfirmDeleteTenant(true);
    } else {
      deleteTenant();
    }
  };

  return (
    <div>
      <p>
        Your current subscription plan is:{" "}
        <b>{plan ? `${plan.name} (${plan.price})` : "Unknown"}</b>
      </p>
      {isStripePlan && currentTenant?.plan.stripeSubscription && (
        <p>
          Billing status: <b>{currentTenant.plan.stripeSubscription.status}</b>{" "}
          {currentTenant.plan.stripeSubscription.card && (
            <span>
              ({currentTenant.plan.stripeSubscription.card.brand} ••••{" "}
              {currentTenant.plan.stripeSubscription.card.last4})
            </span>
          )}
        </p>
      )}
      {isStripePlan &&
        currentTenant?.plan.stripeSubscription?.currentPeriodEnd && (
          <p>
            Current period ends:{" "}
            <b>
              {new Date(
                currentTenant?.plan.stripeSubscription?.currentPeriodEnd
              ).toDateString()}
            </b>
          </p>
        )}
      {!confirmDeleteTenant && (
        <span>
          <button onClick={handleChangePlan}>Change plan</button>{" "}
          {plan?.usesStripe && (
            <span>
              <button onClick={handleChangePaymentMethod}>
                Change payment method
              </button>{" "}
            </span>
          )}
        </span>
      )}
      {confirmDeleteTenant && (
        <p style={{ color: "red" }}>
          Do you really want to delete the tenant and all its data? It cannot be
          undone.
        </p>
      )}
      <button onClick={handleDelete}>
        {confirmDeleteTenant ? "Yes" : "Delete tenant"}
      </button>{" "}
      {confirmDeleteTenant && (
        <button onClick={() => setConfirmDeleteTenant(false)}>No</button>
      )}
    </div>
  );
}

interface TeamMembersProps {
  tenantId: string;
}

function TeamMembers({ tenantId }: TeamMembersProps) {
  const { isLoading: isUserLoading, error: userError, user } = useUser();
  const {
    isLoading: isUsersLoading,
    error: usersError,
    data,
    mutate: refreshUsers,
  } = useApi<GetTenantUsersResponse>({
    path: `/v1/tenant/${tenantId}/user?details`,
  });
  const [deleteIdentityId, setDeleteIdentityId] = useState<string | null>(null);
  const {
    isMutating: isDeletingIdentity,
    error: errorDeletingIdentity,
    trigger: deleteIdentity,
  } = useApiMutate<any>({
    path: `/v1/tenant/${tenantId}/user/${deleteIdentityId}`,
    method: "DELETE",
    afterSuccess: refreshUsers,
  });

  useEffect(() => {
    if (deleteIdentityId) {
      deleteIdentity();
      setDeleteIdentityId(null);
    }
  }, [deleteIdentity, deleteIdentityId]);

  if (isUsersLoading || isUserLoading) return <div>Loading...</div>;
  const error = usersError || errorDeletingIdentity || userError;
  if (error) throw error;

  const handleRemove = (identityId: string) => async () => {
    setDeleteIdentityId(identityId);
  };

  return (
    <table style={style}>
      <thead>
        <tr>
          <th style={style}>Name</th>
          <th style={style}>Email</th>
          <th style={style}>Issuer</th>
          <th style={style}>Subject</th>
          <th style={style}>Action</th>
        </tr>
      </thead>
      <tbody>
        {(data?.identities || []).map((identity) => (
          <tr key={identity.identityId} style={style}>
            <td style={style}>
              {identity.user?.name || "N/A"}
              {user?.identityId === identity.identityId ? ` (that's you)` : ``}
            </td>
            <td style={style}>{identity.user?.email || "N/A"}</td>
            <td style={style}>{identity.iss}</td>
            <td style={style}>{identity.sub}</td>
            <td style={style}>
              {/** Do not allow the removal of self */}
              <button
                disabled={
                  user?.identityId === identity.identityId ||
                  deleteIdentityId === identity.identityId
                }
                onClick={handleRemove(identity.identityId)}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface InvitationsProps {
  tenantId: string;
}

function Invitations({ tenantId }: InvitationsProps) {
  const {
    isLoading: isLoadingInvitations,
    error: errorLoadingInitations,
    data: invitationsResponse,
    mutate: refreshInvitations,
  } = useApi<GetInvitationsResponse>({
    path: `/v1/tenant/${tenantId}/invitation`,
  });
  const { invitations } = invitationsResponse || {};
  const {
    isMutating: isCreatingInvitation,
    error: errorCreatingInvitation,
    trigger: createInvitation,
  } = useApiMutate<Invitation>({
    path: `/v1/tenant/${tenantId}/invitation`,
    method: "POST",
  });
  const [deleteInvitationId, setDeleteInvitationId] = useState<string | null>(
    null
  );
  const {
    isMutating: isDeletingInvitation,
    error: errorDeletingInvitation,
    trigger: deleteInvitation,
  } = useApiMutate<any>({
    path: `/v1/tenant/${tenantId}/invitation/${deleteInvitationId}`,
    method: "DELETE",
    afterSuccess: refreshInvitations,
  });

  useEffect(() => {
    if (deleteInvitationId) {
      deleteInvitation();
      setDeleteInvitationId(null);
    }
  }, [deleteInvitation, deleteInvitationId]);

  if (isLoadingInvitations) return <div>Loading...</div>;
  const error =
    errorLoadingInitations ||
    errorCreatingInvitation ||
    errorDeletingInvitation;
  if (error) throw error;

  const handleRemove = (invitationId: string) => async () => {
    setDeleteInvitationId(invitationId);
  };

  const handleCreate = async () => {
    createInvitation();
  };

  const invitationsComponent = !invitations?.length ? (
    <div>No active invitations.</div>
  ) : (
    <div>
      <table style={style}>
        <thead>
          <tr>
            <th style={style}>Url</th>
            <th style={style}>Created</th>
            <th style={style}>Expires</th>
            <th style={style}>Action</th>
          </tr>
        </thead>
        <tbody>
          {(invitations || []).map((invitation) => (
            <tr key={invitation.invitationId} style={style}>
              <td style={style}>
                {window.location.origin}/join/{tenantId}/
                {invitation.invitationId}
              </td>
              <td style={style}>{new Date(invitation.createdAt).toString()}</td>
              <td style={style}>{new Date(invitation.expiresAt).toString()}</td>
              <td style={style}>
                <button
                  disabled={isDeletingInvitation}
                  onClick={handleRemove(invitation.invitationId)}
                >
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        NOTE: Invitation URLs are tenant-specific, confidential, can be used by
        anyone, and expire after 24h. Send them to the intended recipient using
        a trusted channel, e.g. e-mail.
      </p>
    </div>
  );

  return (
    <div>
      {invitationsComponent}
      <br />
      <button disabled={isCreatingInvitation} onClick={handleCreate}>
        {isCreatingInvitation ? "Creating invitation..." : "Create invitation"}
      </button>
    </div>
  );
}

export default function Team({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId as string;
  return (
    <div>
      <h1>Tenant</h1>
      <h3>Account</h3>
      <Account tenantId={tenantId} />
      <h3>Team members</h3>
      <TeamMembers tenantId={tenantId} />
      <h3>Invitations</h3>
      <Invitations tenantId={tenantId} />
    </div>
  );
}
