"use server";

import { Contact } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

export const getContacts = async (loggedUser: User) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("owner_id", loggedUser.id);

  if (error) {
    console.error("Error al obtener los contactos", error);
    return [];
  }

  return data;
};

export const addContact = async (contact: Contact, loggedUser: User) => {
  const supabase = await createClient();

  const { error, statusText } = await supabase.from("contacts").insert({
    owner_id: loggedUser.id,
    first_name: contact.first_name,
    user_name: contact.user_name,
    last_name: contact.last_name,
    email: contact.email,
    wallet_address: contact.wallet_address,
    phone_number: contact.phone_number,
  });

  if (error) {
    console.error("Error al agregar el contacto", error);
    return null;
  }

  return { statusText, error };
};

export const getContact = async (ownerId: string) => {
  const supabase = await createClient();

  const { error, data } = await supabase
    .from("contacts")
    .select("owner_id, wallet_address")
    .eq("owner_id", ownerId);

  if (error) {
    console.error("Error al obtener el contacto", error);
    return null;
  }

  return data;
};