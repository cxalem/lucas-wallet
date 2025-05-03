"use client";

import type { Contact } from "@/types";
import TransferModal from "../transfer-modal";
import { useI18n } from "@/locales/client";
import { TableRow, TableCell } from "@/components/ui/table";
import { useSearchParams } from "next/navigation";

export const ContactCardContent = ({
  initialContacts,
}: {
  initialContacts: Contact[] | null;
}) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const t = useI18n();

  const contacts = initialContacts || [];

  const sortedContacts = [...contacts].sort((a, b) => {
    const nameA = a.first_name || a.user_name || "";
    const nameB = b.first_name || b.user_name || "";
    return nameA.localeCompare(nameB);
  });

  const nameOrUsername = (contact: Contact) => {
    return contact.first_name
      ? `${contact.first_name}${
          contact.last_name ? " " + contact.last_name : ""
        }`
      : `@${contact.user_name}`;
  };

  const getInitials = (contact: Contact) => {
    if (contact.first_name) {
      return (
        contact.first_name.charAt(0) +
        (contact.last_name
          ? contact.last_name.charAt(0)
          : contact.first_name.charAt(1))
      );
    } else if (contact.user_name) {
      return contact.user_name.substring(0, 2).toUpperCase();
    } else {
      return "••";
    }
  };

  const formatWalletAddress = (address?: string) => {
    if (!address) return "";
    if (address.length <= 10) return address;
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  const filteredContacts = sortedContacts.filter(
    (contact) =>
      nameOrUsername(contact)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      contact.wallet_address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {filteredContacts.length > 0 ? (
        filteredContacts.map((contact) => (
          <TableRow
            key={contact.id}
            className="border-b border-neutral-800 hover:bg-neutral-900/50 transition-colors"
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white text-xs font-medium">
                  {contact.avatarUrl ? (
                    <img
                      src={contact.avatarUrl || "/placeholder.svg"}
                      alt={nameOrUsername(contact)}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(contact)
                  )}
                </div>
                <span className="text-white">{nameOrUsername(contact)}</span>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell font-mono text-xs text-neutral-400 max-w-[200px] truncate">
              <span className="hidden md:inline">{contact.wallet_address}</span>
              <span className="md:hidden">{formatWalletAddress(contact.wallet_address)}</span>
            </TableCell>
            <TableCell className="text-right">
              <TransferModal type="contact" contact={contact} />
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={3} className="text-center text-neutral-400 py-8">
            {searchQuery
              ? t("contacts.search.noResults")
              : t("contacts.empty.title")}
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
