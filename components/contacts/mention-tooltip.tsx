import { Contact } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MentionTooltipProps {
  contact: Contact;
  children: React.ReactNode;
}

export function MentionTooltip({ contact, children }: MentionTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="cursor-pointer font-medium text-blue-200">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-neutral-800 border-neutral-700 text-neutral-200">
          <div className="space-y-1">
            {contact.user_name && (
              <div className="text-sm">
                <span className="text-neutral-400">Username:</span>{" "}
                {contact.user_name}
              </div>
            )}
            {contact.email && (
              <div className="text-sm">
                <span className="text-neutral-400">Email:</span> {contact.email}
              </div>
            )}
            {contact.wallet_address && (
              <div className="text-sm">
                <span className="text-neutral-400">Wallet:</span>{" "}
                <span className="font-mono text-xs">
                  {contact.wallet_address.substring(0, 8)}...
                  {contact.wallet_address.substring(
                    contact.wallet_address.length - 8
                  )}
                </span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
