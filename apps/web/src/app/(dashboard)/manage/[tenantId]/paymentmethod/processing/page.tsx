"use client";

import { useRouter } from "next/navigation";

function ProcessingPaymentUpdate({ params }: { params: { tenantId: string } }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/manage/${params.tenantId}/settings`);
  };

  return (
    <div>
      <p>
        Processing payment details. We will update you when processing is
        complete.
      </p>
      <button onClick={handleClick}>Got to tenant settings</button>
    </div>
  );
}

export default ProcessingPaymentUpdate;
