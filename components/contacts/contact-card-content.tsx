"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Contact } from "@/types";
import TransferModal from "../transfer-modal";
import { useI18n } from "@/locales/client";

export const ContactCardContent = ({ contacts }: { contacts: Contact[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const t = useI18n();

  const sortedContacts = [...contacts].sort((a, b) => {
    if (!a.lastTransaction) return 1;
    if (!b.lastTransaction) return -1;
    return b.lastTransaction.date.getTime() - a.lastTransaction.date.getTime();
  });

  const filteredContacts = sortedContacts.filter((contact) =>
    `${contact.first_name} ${contact.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <CardContent className="pl-6 pr-6 pb-6 pt-2">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("contacts.search.placeholder")}
          className="pl-9 border border-neutral-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredContacts.length > 0 ? (
        <div className="space-y-4 h-[236px] overflow-y-auto">
          {filteredContacts.map((contact) => (
            <TransferModal key={contact.id} type="contact" contact={contact} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 h-[236px] overflow-y-auto flex flex-col justify-center items-center">
          <h3 className="text-lg font-medium">{t("contacts.empty.title")}</h3>
          <p className="text-muted-foreground mt-1">
            {t("contacts.empty.description")}
          </p>
        </div>
      )}
    </CardContent>
  );
};
