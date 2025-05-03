import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ContactsList from "@/components/contacts";

export const metadata = {
  title: "Contacts",
  description: "Manage your contacts.",
};

export default async function PrivatePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/create-wallet");
  }

  return (
    <main className="relative">
      <section className="flex justify-center w-full">
        <ContactsList />
      </section>
    </main>
  );
}
