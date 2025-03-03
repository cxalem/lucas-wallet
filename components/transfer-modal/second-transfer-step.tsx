import { transferFormSchema } from "@/utils/schemas";
import { Button } from "../ui/button";
import { z } from "zod";
import { TransferStateEnum } from "@/types";
import { Separator } from "@radix-ui/react-separator";

type TransferModalSecondStepProps = {
  transferData: z.infer<typeof transferFormSchema>;
  recipient: {
    wallet_address: `0x${string}`;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  setTransferState: (state: TransferStateEnum) => void;
};

export const TransferModalSecondStep = ({
  transferData,
  recipient,
  setTransferState,
}: TransferModalSecondStepProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-zinc-50 gap-1 flex flex-col mt-4">
        <span className="text-zinc-400">To:</span>
        <div className="flex flex-col gap-1 bg-neutral-800 px-4 py-2 rounded-lg">
          <span className="font-semibold text-2xl">
            {recipient?.first_name} {recipient?.last_name}
          </span>{" "}
          <span className="text-zinc-400">{recipient?.email}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-zinc-400">Amount:</span>
        <div className="flex gap-2 items-end justify-between bg-neutral-800 px-4 py-2 rounded-lg w-full">
          <span className="font-bold text-3xl">${transferData.amount}</span>
          <span className="text-zinc-400">{transferData.amount} ETH</span>
        </div>
      </div>

      <div className="px-2 opacity-40">
        <Separator className="my-4 border border-neutral-100" />
      </div>

      <div className="flex gap-4 w-full">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setTransferState(TransferStateEnum.Idle)}
        >
          Back
        </Button>
        <Button
          className="w-full"
          onClick={() => setTransferState(TransferStateEnum.Pending)}
        >
          Transfer
        </Button>
      </div>
    </div>
  );
};
