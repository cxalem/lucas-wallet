import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactCardContent } from "./contact-card-content";
import { createClient } from "@/utils/supabase/server";
import { getCurrentLocale, getI18n } from "@/locales/server";
import { I18nProviderClient } from "@/locales/client";
import { Suspense } from "react";
import { ContactsTableLoading } from "./contacts-table-loading";
import { getContacts } from "./actions"; // Import getContacts
import { SearchBar } from "@/components/contacts/search-bar";

export default async function ContactsList() {
  const supabase = await createClient();
  const t = await getI18n();
  const locale = await getCurrentLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error(t("contacts.error.noUser"));
    // Optionally redirect or return an error component
    return null;
  }

  // Fetch contacts data here
  const contactsData = await getContacts(user);
  // TODO: Add error handling for getContacts if necessary

  return (
    <Suspense fallback={<ContactsTableLoading />}>
      <div className="w-full h-full border border-neutral-50/20 mx-auto pb-4 bg-neutral-900/70 backdrop-blur-md rounded-xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white mb-2">
            {t("contacts.list.title")}
          </h2>
          <I18nProviderClient locale={locale}>
            <SearchBar />
          </I18nProviderClient>
        </div>
        <div className="overflow-y-auto h-[calc(100%-120px)]">
          <Table>
            <TableHeader className="bg-neutral-800">
              <TableRow className="border-b border-neutral-800 hover:bg-transparent">
                <TableHead className="text-neutral-400 font-medium pl-12">
                  {t("contacts.table.header.name")}
                </TableHead>
                <TableHead className="hidden sm:table-cell text-neutral-400 font-medium">
                  {t("contacts.table.header.address")}
                </TableHead>
                <TableHead className="text-neutral-400 font-medium text-center">
                  {t("contacts.table.header.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <I18nProviderClient locale={locale}>
              <TableBody>
                <ContactCardContent initialContacts={contactsData} />
              </TableBody>
            </I18nProviderClient>
          </Table>
        </div>
      </div>
    </Suspense>
  );
}
