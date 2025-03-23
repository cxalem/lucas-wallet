"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/utils/supabase/server";
import { createSolanaWallet } from "./utils";
import { encryptData } from "@/app/[locale]/security/encrypt";

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email." }),
  password: z
    .string()
    .min(6, { message: "The password must be at least 6 characters long." }),
  user_name: z.string().min(1, { message: "Enter your username." }),
});

export async function signup(formData: FormData) {
  const result = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    user_name: formData.get("user_name"),
  });

  if (!result.success) {
    console.error("Invalid form data:", result.error.issues);
    redirect("/error");
    return;
  }

  const { email, password, user_name } = result.data;

  const supabase = await createClient();
  const { data: existingUserData, error: existingUserError } = await supabase
    .from("profiles")
    .select("email, user_name")
    .eq("email", email)
    .eq("user_name", user_name)
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

  const { address, privateKey, mnemonic } = createSolanaWallet();

  const { salt, iv, ciphertext } = await encryptData(
    password,
    JSON.stringify({ privateKey, mnemonic })
  );

  const signUpPayload = {
    email,
    password,
    options: {
      data: {
        user_name,
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
    user_name,
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

export const placeHolderFunction = async () => {
  console.log("Not working yet");
};
