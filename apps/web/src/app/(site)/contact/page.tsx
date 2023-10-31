"use client";

import { useTenant } from "../../../components/TenantProvider";

export default function Contact() {
  const { currentTenant } = useTenant();

  return (
    <div>
      <h1>Contact Us</h1>
    </div>
  );
}
