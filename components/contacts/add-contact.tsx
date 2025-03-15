"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/locales/client";

export const AddContact = () => {
  const t = useI18n();

  return (
    <Dialog>
      <DialogTrigger>{t("contacts.add")}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contacts.dialog.title")}</DialogTitle>
          <DialogDescription>
            {t("contacts.dialog.description")}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
