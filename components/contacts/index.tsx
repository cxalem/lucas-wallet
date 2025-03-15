import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ContactCardContent } from "./contact-card-content";
import { getContacts } from "./actions";
import { Contact } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { getCurrentLocale, getI18n } from "@/locales/server";
import { I18nProviderClient } from "@/locales/client";

export default async function ContactsList() {
  const supabase = await createClient();
  const t = await getI18n();
  const locale = await getCurrentLocale();
  const loggedUser = await supabase.auth.getUser();

  if (!loggedUser?.data.user) {
    console.error(t("contacts.error.noUser"));
    return null;
  }

  const contacts = (await getContacts(loggedUser.data.user)) as Contact[];

  return (
    <Card className="w-full max-w-3xl mx-auto bg-gradient-to-b from-neutral-900/70 via-neutral-800/70 to-neutral-900/70 backdrop-blur-md rounded-xl">
      <CardHeader className="text-blue-50 pl-6 pt-6 pr-6 pb-2">
        <CardTitle className="text-3xl font-bold">
          {t("contacts.list.title")}
        </CardTitle>
        <CardDescription className="text-blue-50 opacity-60 text-lg">
          {t("contacts.list.description")}
        </CardDescription>
      </CardHeader>
      <I18nProviderClient locale={locale}>
        <ContactCardContent contacts={contacts} />
      </I18nProviderClient>
    </Card>
  );
}
