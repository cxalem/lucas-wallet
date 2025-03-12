"use server";

import { redisClient } from "@/utils/redis/client";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { verifyMessage } from "viem";
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

  revalidatePath("/", "layout");
  redirect("/wallet");
}

export const generateNonce = async (address: `0x${string}` | undefined) => {
  if (!address) {
    throw new Error("Address is required");
  }
  const nonce = uuidv4();
  redisClient.set(address, nonce, "EX", 60 * 5);
  return nonce;
};

export const verifySignature = async (
  address: `0x${string}` | undefined,
  signature: `0x${string}` | undefined
) => {
  if (!address || !signature) {
    throw new Error("Address and signature are required");
  }

  const nonce = await redisClient.get(address);

  if (!nonce) {
    throw new Error("Nonce not found");
  }

  const recoveredAddress = verifyMessage({
    message: nonce,
    address,
    signature,
  });

  if (!recoveredAddress) {
    throw new Error("Invalid signature");
  }

  return recoveredAddress;
};

interface IsUserInDbResult {
  isInDb: boolean;
  data?: any;
  error?: string;
}

export const isUserInDb = async (
  address: `0x${string}` | undefined
): Promise<IsUserInDbResult> => {
  if (!address) {
    throw new Error("Address is required");
  }

  const supabase = await createClient();

  try {
    // Convert the address to lowercase to match DB storage conventions
    const lowerAddress = address.toLowerCase();

    // Use .maybeSingle() to get either 0 or 1 row without throwing an error
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("wallet_address", lowerAddress)
      .maybeSingle();

    if (error) {
      console.error("Error verifying user:", error);
      return { isInDb: false, error: error.message };
    }

    if (!data) {
      // No matching record found
      return { isInDb: false, error: "User not found" };
    }

    // User record found
    return { isInDb: true, data };
  } catch (err) {
    console.error("Unexpected error verifying user:", err);
    return { isInDb: false, error: "An unexpected error occurred" };
  }
};

export const createUser = async (
  address: `0x${string}` | undefined,
  email: string
) => {
  if (!address) {
    throw new Error("Address is required");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (error) {
    console.log(error);
    return {
      error: error.message,
    };
  }

  return {
    data,
    error: null,
  };
};
