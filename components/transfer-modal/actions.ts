"use server";

import { decryptData } from "@/app/[locale]/security/encrypt";
import { createClient } from "@/utils/supabase/server";
import { client } from "@/wallet.config";
import { formatEther } from "viem";
import { z } from "zod";
import { transactionReceiptSchema } from "@/utils/schemas";

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
  const decrypted = await decryptData(password, {
    salt: userMetadata.salt,
    iv: userMetadata.iv,
    ciphertext: userMetadata.ciphertext,
  });
  const { privateKey } = JSON.parse(decrypted);
  return privateKey;
}

export const getTransactionDetails = async (transactionHash: `0x${string}`) => {
  const tx = await client.waitForTransactionReceipt({
    hash: transactionHash,
  });
  return tx;
};

export const addTransactionToDb = async (
  transaction: z.infer<typeof transactionReceiptSchema>,
  from_user: {
    wallet_address: `0x${string}`;
    email: string;
  },
  to_user: {
    wallet_address: `0x${string}`;
    email: string;
  },
  created_at: string
) => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("transactions").insert({
    transaction_hash: transaction.transactionHash,
    from: JSON.stringify(from_user),
    to: JSON.stringify(to_user),
    block_number: Number(transaction.blockNumber),
    created_at: created_at,
    transaction_type: transaction.type,
  });
  if (error) {
    console.error("Error al agregar la transacción a la base de datos", error);
    return;
  }
  return data;
};
