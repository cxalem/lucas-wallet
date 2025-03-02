"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/utils/supabase/server";
import { createWallet } from "./utils";
import { encryptData } from "@/app/security/encrypt";

const signupSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  first_name: z.string().min(1, { message: "Ingresa tu nombre." }),
  last_name: z.string().min(1, { message: "Ingresa tu apellido." }),
  phone: z.string().min(1, { message: "Ingresa tu teléfono." }),
});

export async function signup(formData: FormData) {
  const result = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
  });

  if (!result.success) {
    console.error("Invalid form data:", result.error.issues);
    redirect("/error");
    return;
  }

  const { email, password, first_name, last_name } = result.data;

  const supabase = await createClient();
  const { data: existingUserData, error: existingUserError } = await supabase
    .from("profiles")
    .select("email")
    .eq("email", email)
    .single();

  if (existingUserError && existingUserError.code !== "PGRST116") {
    // If there's a non-"Row not found" error, handle it
    console.error("Error checking existing user:", existingUserError);
    redirect("/error");
    return;
  }

  if (existingUserData) {
    console.error("User with this email already exists:", email);
    redirect("/error");
    return;
  }

  const { address, privateKey, mnemonic } = createWallet();

  const { salt, iv, ciphertext } = await encryptData(
    password,
    JSON.stringify({ privateKey, mnemonic })
  );

  const signUpPayload = {
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
        wallet_address: address,
        salt,
        iv,
        ciphertext,
      },
    },
  };

  const { data: userData, error: signUpError } = await supabase.auth.signUp(
    signUpPayload
  );

  if (signUpError || !userData.user) {
    console.error("Error during signUp:", signUpError);
    redirect("/error");
    return;
  }

  const profilePayload = {
    id: userData.user.id,
    email,
    first_name,
    last_name,
    wallet_address: address,
    salt,
    iv,
    ciphertext,
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .insert(profilePayload);

  if (profileError) {
    console.error("Error inserting profile:", profileError);
    redirect("/error");
    return;
  }

  revalidatePath("/", "layout");
  redirect("/");
}
