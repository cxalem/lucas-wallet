import { Loader2 } from "lucide-react";
import { useI18n } from "@/locales/client";

export const SendingTransactionStep = () => {
  const t = useI18n();

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
      <p className="text-lg font-medium text-zinc-300">
        {t("transfer.status.processing")}
      </p>
      <p className="text-sm text-zinc-500">
        {t("transfer.status.processingDescription")}
      </p>
    </div>
  );
}; 