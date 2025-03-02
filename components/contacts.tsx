"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Contact } from "@/types";
import TransferModal from "./transfer-modal";

const CONTACTS: Contact[] = [
  {
    id: "1",
    first_name: "Angely",
    last_name: "Rodriguez",
    email: "cami.vengy@gmail.com",
    phone: "922304636",
    lastTransaction: {
      id: "t1",
      date: new Date("2023-03-01"),
      amount: 250,
    },
  },
  {
    id: "4",
    first_name: "Alejandro",
    last_name: "Mena",
    email: "alejandro.mena@gmail.com",
    phone: "922304636",
    lastTransaction: {
      id: "t1",
      date: new Date("2023-03-01"),
      amount: 250,
    },
  },
  {
    id: "2",
    first_name: "Andrés",
    last_name: "Dominguez",
    email: "andresdom@gmail.com",
    phone: "541987765",
    lastTransaction: {
      id: "t2",
      date: new Date("2023-02-28"),
      amount: 120,
    },
  },
  {
    id: "3",
    first_name: "Jose",
    last_name: "Garcia",
    email: "jose_g@gmail.com",
    lastTransaction: {
      id: "t3",
      date: new Date("2023-02-15"),
      amount: 75,
    },
  },
];

export default function ContactsList() {
  // Sample data - in a real app, this would come from an API or database

  const [searchQuery, setSearchQuery] = useState("");

  // Sort contacts by most recent transaction
  const sortedContacts = [...CONTACTS].sort((a, b) => {
    if (!a.lastTransaction) return 1;
    if (!b.lastTransaction) return -1;
    return b.lastTransaction.date.getTime() - a.lastTransaction.date.getTime();
  });

  // Filter contacts based on search query
  const filteredContacts = sortedContacts.filter(
    (contact) =>
      `${contact.first_name} ${contact.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.phone && contact.phone.includes(searchQuery))
  );

  return (
    <Card className="w-full max-w-3xl mx-auto bg-gradient-to-b from-neutral-900/70 via-neutral-800/70 to-neutral-900/70 backdrop-blur-md rounded-xl">
      <CardHeader className="text-blue-50 pl-6 pt-6 pr-6 pb-2">
        <CardTitle className="text-3xl font-bold">
          Transfiere dinero a tus contactos!
        </CardTitle>
        <CardDescription className="text-blue-50 opacity-60 text-lg">
          Últimos contactos a los que has transferido dinero
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-6 pr-6 pb-6 pt-2">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a specific contact"
            className="pl-9 border border-neutral-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredContacts.length > 0 ? (
          <div className="space-y-4 h-[236px] overflow-y-auto">
            {filteredContacts.map((contact) => (
              <TransferModal
                key={contact.id}
                type="contact"
                contact={contact}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 h-[236px] overflow-y-auto flex flex-col justify-center items-center">
            <h3 className="text-lg font-medium">No contacts found</h3>
            <p className="text-muted-foreground mt-1">
              You have no contacts or recent transactions to display
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
