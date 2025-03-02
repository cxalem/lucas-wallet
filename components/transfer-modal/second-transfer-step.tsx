import { transferFormSchema } from "@/utils/schemas";
import { Button } from "../ui/button";
import { z } from "zod";
import { TransferStateEnum } from "@/types";

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
      <p>
        ¿Estás seguro de que deseas transferir{" "}
        <span className="text-red-400">{transferData.amount} ETH</span> a{" "}
        <span className="text-red-400 font-bold">
          {recipient?.first_name} {recipient?.last_name} ({recipient?.email})
        </span>
        ?
      </p>
      <div className="flex gap-4">
        <Button onClick={() => setTransferState(TransferStateEnum.Pending)}>
          Sí
        </Button>
        <Button
          variant="secondary"
          onClick={() => setTransferState(TransferStateEnum.Idle)}
        >
          No
        </Button>
      </div>
    </div>
  );
};
