"use client";

import { DraftingCompass } from "lucide-react";

export interface LandingProps {}

export function Landing({}: LandingProps) {
  return (
    <div className="flex gap-6 items-center justify-center min-w-full h-96">
      <div className="flex gap-4 items-center">
        <DraftingCompass size={64} />
        <div>Future landing page of your product - make it yours</div>
      </div>
    </div>
  );
}
