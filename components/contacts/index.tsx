import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ContactCardContent } from "./contact-card-content";
import { getContacts } from "./actions";
import { Profile } from "@/types";

export default async function ContactsList() {
  const contacts = (await getContacts()) as Profile[];

  return (
    <Card className="w-full max-w-3xl mx-auto bg-gradient-to-b from-neutral-900/70 via-neutral-800/70 to-neutral-900/70 backdrop-blur-md rounded-xl">
      <CardHeader className="text-blue-50 pl-6 pt-6 pr-6 pb-2">
        <CardTitle className="text-3xl font-bold">
          Transfer funds to your contacts
        </CardTitle>
        <CardDescription className="text-blue-50 opacity-60 text-lg">
          Last contacts you&apos;ve transferred funds to
        </CardDescription>
      </CardHeader>
      <ContactCardContent contacts={contacts} />
    </Card>
  );
}
