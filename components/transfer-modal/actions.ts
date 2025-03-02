"use server";

import { decryptData } from "@/app/security/encrypt";
import { createClient } from "@/utils/supabase/server";
import { client } from "@/wallet.config";
import { formatEther } from "viem";

export const getUserBalance = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error al obtener el usuario", error);
    return;
  }

  const { user_metadata } = data.user;
  const balance = await client.getBalance({
    address: user_metadata.wallet_address,
  });
  const formattedBalance = formatEther(balance);
  return formattedBalance.slice(0, 5);
};

export async function decryptPrivateKey(
  password: string,
  userMetadata: { salt: string; iv: string; ciphertext: string }
): Promise<string> {
  // Desencriptar la llave privada
  const decrypted = await decryptData(password, {
    salt: userMetadata.salt,
    iv: userMetadata.iv,
    ciphertext: userMetadata.ciphertext,
  });
  const { privateKey } = JSON.parse(decrypted);
  return privateKey;
}
