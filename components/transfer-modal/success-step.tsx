import { Separator } from "@radix-ui/react-separator";
import { CopyHash } from "../copy-hash";
import { UserRoundPen } from "lucide-react";
import { transferFormSchema } from "@/utils/schemas";
import { z } from "zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";

type TransferSuccessProps = {
  onClick: () => void;
  transferData: z.infer<typeof transferFormSchema> | null;
  recipient: {
    first_name: string;
    last_name: string;
  } | null;
  transactionHash: `0x${string}` | null;
  isContactAdded: boolean | undefined;
  handleAddContact: () => void;
};

export const TransferSuccess = ({
  onClick,
  transferData,
  recipient,
  transactionHash,
  isContactAdded,
  handleAddContact,
}: TransferSuccessProps) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col mt-4">
        <span className="text-zinc-50 text-opacity-70">You&apos;ve sent</span>
        <span className="text-zinc-50 font-bold text-2xl">
          {transferData?.amount} ETH
        </span>
      </div>
      <div className="flex gap-2 items-end">
        <span className="text-zinc-50 text-opacity-70">To:</span>
        <span className="text-zinc-50 font-bold text-xl">
          {recipient?.first_name} {recipient?.last_name}
        </span>
      </div>

      <div className="flex px-1 w-full mt-2">
        <Separator className="border border-neutral-50/40 w-full" />
      </div>

      <div className="flex justify-between gap-2 px-1">
        <span className="text-zinc-50/70">Transaction hash:</span>
        <span title={transactionHash ?? ""} className="text-zinc-50">
          <CopyHash hash={transactionHash ?? ""} />
        </span>
      </div>

      <div className="flex w-full gap-3">
        <DialogClose asChild>
          <Button className="w-full" onClick={onClick}>
            Close
          </Button>
        </DialogClose>
        {!isContactAdded && (
          <Button
            onClick={handleAddContact}
            variant={"secondary"}
            className="flex items-center"
          >
            <UserRoundPen className="w-4 h-4" /> Add to contacts
          </Button>
        )}
      </div>
    </div>
  );
};
