"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTenant } from "components/TenantProvider";
import { useApiMutate } from "components/common-client";
import { ContactMessagePayload } from "@letsgo/types";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Label } from "components/ui/label";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";
import { Button } from "components/ui/button";
import { useToast } from "components/ui/use-toast";

interface ContactParams {
  email: string;
  name: string;
  message: string;
}

export function Contact() {
  const query = useSearchParams();
  const { toast } = useToast();
  const { isLoading: isUserLoading, user } = useUser();
  const { currentTenant } = useTenant();
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
      setParams({ email: "", name: "", message: "" });
      toast({
        title: "Message sent - thank you!",
      });
    },
  });

  useEffect(() => {
    if (user && (!params.email || !params.name)) {
      setParams({
        email: params.email || user.email || "",
        name: params.name || user.name || "",
        message: params.message,
      });
    }
  }, [user, params.email, params.name, params.message]);

  if (errorSubmiting) throw errorSubmiting;

  const handleSubmit = () => {
    const payload: ContactMessagePayload = {
      ...params,
      query: Object.fromEntries(query.entries()),
      tenantId: currentTenant?.tenantId,
      identityId: user?.identityId as string,
      timestamp: new Date().toISOString(),
    };
    submitContact(payload);
  };

  return (
    <div className="min-w-full flex flex-col items-center">
      <Card className="border-none shadow-none w-6/12 min-w-[400px]">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              disabled={isSubmitting}
              value={params.name}
              onChange={(e) => setParams({ ...params, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              disabled={isSubmitting}
              value={params.email}
              onChange={(e) => setParams({ ...params, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              disabled={isSubmitting}
              className="resize-none"
              id="message"
              rows={10}
              value={params.message}
              onChange={(e) =>
                setParams({ ...params, message: e.target.value })
              }
            />
          </div>
          <div className="mt-6">
            <Button disabled={isSubmitting} onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
