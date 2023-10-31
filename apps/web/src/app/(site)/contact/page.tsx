"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTenant } from "../../../components/TenantProvider";
import { useApiMutate } from "../../../components/common-client";

interface ContactParams {
  email: string;
  name: string;
  message: string;
}

export default function Contact() {
  const query = useSearchParams();
  const { isLoading: isUserLoading, user } = useUser();
  const { currentTenant } = useTenant();
  const [submitted, setSubmitted] = useState(false);
  const [params, setParams] = useState<ContactParams>({
    email: "",
    name: "",
    message: "",
  });
  const {
    isMutating: isSubmitting,
    error: errorSubmiting,
    trigger: submitContact,
  } = useApiMutate<void>({
    path: `/v1/contact`,
    method: "POST",
    unauthenticated: true,
    afterSuccess: async () => {
      setSubmitted(true);
    },
  });

  useEffect(() => {
    if (user) {
      setParams({
        email: user.email || "",
        name: user.name || "",
        message: "",
      });
    }
  }, [user]);

  if (errorSubmiting) throw errorSubmiting;
  if (isUserLoading) return <div>Loading...</div>;
  if (submitted) return <div>Thank you for your message!</div>;
  if (isSubmitting) return <div>Submitting...</div>;

  const handleSubmit = () => {
    const payload = {
      ...params,
      query: Object.fromEntries(query.entries()),
      tenantId: currentTenant?.tenantId,
      identityId: user?.identityId,
    };
    submitContact(payload);
  };

  return (
    <div>
      <h1>Contact Us</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          width: "500px",
          minWidth: "500px",
        }}
      >
        <div>Name:</div>
        <input
          name="name"
          type="text"
          value={params.name}
          onChange={(e) => setParams({ ...params, name: e.target.value })}
        />
        <br></br>
        Email:
        <input
          name="email"
          type="email"
          value={params.email}
          onChange={(e) => setParams({ ...params, email: e.target.value })}
        />
        <br></br>
        Message:
        <textarea
          name="message"
          rows={10}
          value={params.message}
          onChange={(e) => setParams({ ...params, message: e.target.value })}
        />
      </div>
      <br></br>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
