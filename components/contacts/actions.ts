"use server";

import { Profile } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

export const getContacts = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("contacts").select("*");

  if (error) {
    console.error("Error al obtener los contactos", error);
    return [];
  }

  return data;
};

export const addContact = async (contact: Profile, loggedUser: User) => {
  const supabase = await createClient();

  const { error, statusText } = await supabase.from("contacts").insert({
    owner_id: loggedUser.id,
    contact_name: contact.first_name,
    contact_last_name: contact.last_name,
    contact_email: contact.email,
    wallet_address: contact.wallet_address,
    phone_number: contact.phone_number,
  });

  if (error) {
    console.error("Error al agregar el contacto", error);
    return null;
  }

  return { statusText, error };
};

export const getContact = async (contactId: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId);

  if (error) {
    console.error("Error al obtener el contacto", error);
    return null;
  }
};
