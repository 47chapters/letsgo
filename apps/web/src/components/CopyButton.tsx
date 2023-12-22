"use client";

import { Copy } from "lucide-react";
import { Button } from "components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/ui/tooltip";
import { useEffect, useState } from "react";

export interface CopyButtonProps {
  text: string;
  tooltipText?: string;
  buttonClassName?: string;
  iconClassName?: string;
}

export function CopyButton({
  text,
  tooltipText = "Copy",
  buttonClassName = "h-8 p-2.5",
  iconClassName = "w-3 h-3",
}: CopyButtonProps) {
  const [enableToolTip, setEnableToolTip] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  // Workaround for the tooltip showing up by default on first render in a popup.
  useEffect(() => {
    if (!enableToolTip) {
      setTimeout(() => {
        setEnableToolTip(true);
      }, 100);
    }
  }, [enableToolTip, setEnableToolTip]);

  const button = (
    <Button variant="ghost" onClick={handleCopy} className={buttonClassName}>
      <Copy className={iconClassName} />
    </Button>
  );

  return enableToolTip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    button
  );
}
