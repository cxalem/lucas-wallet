"use client";

import { z } from "zod";

import { DialogTrigger } from "@/components/ui/dialog";
import { transferFormSchema } from "@/utils/schemas";

import { getUsdcBalance } from "../transfer-modal/actions";
import { UseFormReturn } from "react-hook-form";
import { Contact } from "@/types";
import { useI18n } from "@/locales/client";

type ContactCardProps = {
  contact: Contact;
  transferForm: UseFormReturn<z.infer<typeof transferFormSchema>>;
  setUserBalance: (balance: string) => void;
  setUserContact: (contact: Contact) => void;
};

export const ContactCard = ({
  contact,
  transferForm,
  setUserBalance,
  setUserContact,
}: ContactCardProps) => {
  const t = useI18n();

  return (
    <DialogTrigger
      onClick={() => {
        transferForm.setValue("email", contact.email);
        getUsdcBalance().then((balance) => {
          if (balance !== undefined && balance !== null) {
            setUserBalance(String(balance));
          }
        });
        setUserContact({
          id: contact.id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          user_name: contact.user_name,
          email: contact.email,
          wallet_address: contact.wallet_address,
          phone_number: contact.phone_number,
          avatarUrl: contact.avatarUrl,
        } as unknown as Contact);
      }}
      className="w-full"
    >
      <div className="bg-neutral-50/10 cursor-pointer rounded-md py-2 px-4 w-fit mx-auto hover:bg-neutral-50/20">
        {t("contacts.card.send")}
      </div>
    </DialogTrigger>
  );
};
