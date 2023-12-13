"use client";

import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { useRouter } from "next/navigation";

function ProcessingPaymentMethodUpdate({
  params,
}: {
  params: { tenantId: string };
}) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/manage/${params.tenantId}/subscription`);
  };

  return (
    <Card className="borner-none shadown-none max-w-2xl">
      <CardHeader>
        <CardTitle>Processing payment</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-6">
        <div>
          Payment processing is in progress. We will update you when processing
          is complete.
        </div>
        <div>
          <Button onClick={handleClick}>Back to subscription</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProcessingPaymentMethodUpdate;
