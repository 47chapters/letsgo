"use client";

import { DraftingCompass } from "lucide-react";

export interface DashboardProps {
  tenantId: string;
}

export function Dashboard({ tenantId }: DashboardProps) {
  return (
    <div className="flex gap-6 items-center">
      <DraftingCompass size={64} />
      <div>Future home of your product&apos;s dashboard - make it yours</div>
    </div>
  );
}
