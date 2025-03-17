"use server";

import { decryptData } from "@/app/security/encrypt";
import { createClient } from "@/utils/supabase/server";
import { client } from "@/wallet.config";
import { formatEther } from "viem";
import { z } from "zod";
import { solanaTransactionSchema } from "@/utils/schemas";
import { Connection, PublicKey } from "@solana/web3.js";
import { USDC_MINT_ADDRESS } from "@/utils/constants";

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

export const getUsdcBalance = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error al obtener el usuario", error);
    return;
  }

  const { user_metadata } = data.user;

  const connection = new Connection(
    `https://solana-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    "confirmed"
  );
  const publicKey = new PublicKey(user_metadata.wallet_address);

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    publicKey,
    { mint: new PublicKey(USDC_MINT_ADDRESS) }
  );

  const usdcBalance = tokenAccounts.value[0]
    ? tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount
    : 0;

  return usdcBalance;
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
  transaction: z.infer<typeof solanaTransactionSchema>,
  from_user: {
    wallet_address: string;
    email: string;
  },
  to_user: {
    wallet_address: string;
    email: string;
  },
  created_at: string
) => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("transactions").insert({
    transaction_hash: transaction.signature,
    from: JSON.stringify(from_user),
    to: JSON.stringify(to_user),
    amount: transaction.amount,
    created_at: created_at,
  });
  if (error) {
    console.error("Error al agregar la transacción a la base de datos", error);
    return;
  }
  return data;
};
