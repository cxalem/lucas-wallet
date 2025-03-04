"use client";

import { z } from "zod";

import { DialogTrigger } from "@/components/ui/dialog";
import { transferFormSchema } from "@/utils/schemas";

import { getUserBalance } from "../transfer-modal/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { UseFormReturn } from "react-hook-form";
import { Contact } from "@/types";
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
  const getInitials = (first_name: string, last_name: string) => {
    return `${first_name[0]}${last_name[0]}`.toUpperCase();
  };

  return (
    <DialogTrigger
      onClick={() => {
        transferForm.setValue("email", contact.email);
        getUserBalance().then((balance) => {
          if (balance) {
            setUserBalance(balance);
          }
        });
        setUserContact({
          id: contact.id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          wallet_address: contact.wallet_address,
          phone_number: contact.phone_number,
          avatarUrl: contact.avatarUrl,
        } as unknown as Contact);
      }}
      className="flex cursor-pointer items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors w-full"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {contact.avatarUrl ? (
            <Image
              src={contact.avatarUrl || "/placeholder.svg"}
              alt={`${contact.first_name} ${contact.last_name}`}
              width={40}
              height={40}
            />
          ) : (
            <AvatarFallback>
              {getInitials(contact.first_name, contact.last_name)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col text-start">
          <span className="text-sm text-muted-foreground">{contact.email}</span>
          <span className="font-medium">
            {contact.first_name} {contact.last_name}
          </span>
        </div>
      </div>
      {contact?.phone_number && (
        <span className="text-muted-foreground">{contact.phone_number}</span>
      )}
    </DialogTrigger>
  );
};
