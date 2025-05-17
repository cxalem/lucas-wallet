"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.log(error);
    return {
      error: error.message,
      status: error.status,
      errorName: error.name,
    };
  }

  // Ensure we have a session before redirecting
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return {
      error: "Failed to establish session",
      status: 500,
      errorName: "SessionError",
    };
  }

  revalidatePath("/", "layout");
  redirect("/wallet");
}
