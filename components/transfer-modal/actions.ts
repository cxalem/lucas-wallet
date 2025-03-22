"use server";

// ======== External Libraries ========
import base64 from "base64-js";
import { formatEther } from "viem";
import { z } from "zod";

// ======== Blockchain Libraries ========
import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";

// ======== Local Modules ========
import { decryptData } from "@/app/[locale]/security/encrypt";
import { createClient } from "@/utils/supabase/server";
import { client } from "@/wallet.config";
import { solanaTransactionSchema } from "@/utils/schemas";
import { USDC_MINT_ADDRESS } from "@/utils/constants";

// ======== Helper Functions ========

/**
 * Validates the sender's account info before processing a transaction.
 * Checks for sufficient SOL for fees and ensures the sender has USDC.
 *
 * @param connection - The Solana connection instance.
 * @param senderTokenAccount - The sender's associated USDC token account.
 * @param from - The sender's Keypair.
 */
const getSenderAccountInfo = async (
  connection: Connection,
  senderTokenAccount: PublicKey,
  from: Keypair
) => {
  try {
    const senderAccountInfo = await getAccount(connection, senderTokenAccount);
    const senderSolBalance = await connection.getBalance(from.publicKey);
    if (senderSolBalance < 5000) {
      throw new Error(
        "❌ Sender does not have enough SOL to pay for transaction fees."
      );
    }
    if (senderAccountInfo.amount === BigInt(0)) {
      throw new Error("❌ Sender has 0 USDC in their token account.");
    }
  } catch (e) {
    console.log(e);
  }
};

// ======== Transaction Functions ========

/**
 * Transfers USDC tokens on Solana using sendAndConfirmTransaction.
 *
 * @param from - The sender's Keypair.
 * @param to - The receiver's PublicKey.
 * @param amount - The amount of USDC tokens to transfer (in USDC units).
 * @returns The transaction signature.
 */
export async function transferSolana(
  from: Keypair,
  to: PublicKey,
  amount: number
) {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_GO_GETBLOCK_URL!,
    "confirmed"
  );

  const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
  const senderTokenAccount = await getAssociatedTokenAddress(
    usdcMint,
    from.publicKey
  );
  const receiverTokenAccount = await getAssociatedTokenAddress(
    usdcMint,
    new PublicKey(to)
  );

  const transaction = new Transaction();

  try {
    await getAccount(connection, receiverTokenAccount);
  } catch (e) {
    console.log(
      "🚀 Receiver does not have a USDC token account. Creating one...",
      e
    );
    transaction.add(
      createAssociatedTokenAccountInstruction(
        from.publicKey,
        receiverTokenAccount,
        to,
        usdcMint
      )
    );
  }

  transaction.add(
    createTransferInstruction(
      senderTokenAccount,
      receiverTokenAccount,
      from.publicKey,
      amount * 1e6
    )
  );

  if (!(from instanceof Keypair)) {
    throw new Error("❌ 'from' must be a valid Keypair");
  }

  await getSenderAccountInfo(connection, senderTokenAccount, from);
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);
  console.log(`✅ USDC sent! Transaction Signature: ${signature}`);
  return signature;
}

/**
 * Sends a USDC transaction on Solana by manually serializing the transaction
 * and posting it to the network.
 *
 * @param from - The sender's Keypair.
 * @param to - The receiver's PublicKey.
 * @param amount - The amount of USDC tokens to transfer (in USDC units).
 * @returns The transaction result from the network.
 */
export const sendSolanaTransaction = async (
  from: Uint8Array<ArrayBuffer>,
  to: PublicKey,
  amount: number
) => {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_GO_GETBLOCK_URL!,
    "confirmed"
  );

  const transaction = new Transaction();
  const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
  const senderKeypair = Keypair.fromSecretKey(from);
  
  const senderTokenAccount = await getAssociatedTokenAddress(
    usdcMint,
    senderKeypair.publicKey
  );
  const receiverTokenAccount = await getAssociatedTokenAddress(
    usdcMint,
    new PublicKey(to)
  );

  try {
    await getAccount(connection, receiverTokenAccount);
  } catch (e) {
    console.log(
      "🚀 Receiver does not have a USDC token account. Creating one...",
      e
    );
    transaction.add(
      createAssociatedTokenAccountInstruction(
        senderKeypair.publicKey,
        receiverTokenAccount,
        to,
        usdcMint
      )
    );
  }

  transaction.add(
    createTransferInstruction(
      senderTokenAccount,
      receiverTokenAccount,
      senderKeypair.publicKey,
      amount * 1e6
    )
  );

  transaction.recentBlockhash = (
    await connection.getLatestBlockhash("finalized")
  ).blockhash;
  transaction.feePayer = senderKeypair.publicKey;
  transaction.sign(senderKeypair);

  const serializedTransaction = transaction.serialize();
  const base64Transaction = base64.fromByteArray(serializedTransaction);

  await getSenderAccountInfo(connection, senderTokenAccount, senderKeypair);

  const response = await fetch(process.env.NEXT_PUBLIC_GO_GETBLOCK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "sendTransaction",
      params: [
        base64Transaction,
        {
          encoding: "base64",
          maxRetries: 5,
        },
      ],
    }),
  });

  const result = await response.json();
  return result.result;
};

// ======== Balance Functions ========

/**
 * Retrieves the user's wallet balance (in Ether) using Supabase authentication.
 *
 * @returns A formatted wallet balance (first 5 characters).
 */
export const getUserBalance = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user", error);
    return;
  }

  const { user_metadata } = data.user;
  const balance = await client.getBalance({
    address: user_metadata.wallet_address,
  });
  const formattedBalance = formatEther(balance);
  return formattedBalance.slice(0, 5);
};

/**
 * Retrieves the user's USDC token balance on Solana.
 *
 * @returns The USDC balance.
 */
export const getUsdcBalance = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user", error);
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

// ======== Encryption Utilities ========

/**
 * Decrypts the user's private key using the provided password and metadata.
 *
 * @param password - The password for decryption.
 * @param userMetadata - An object containing salt, iv, and ciphertext.
 * @returns The decrypted private key.
 */
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

// ======== Transaction Details & Database Operations ========

/**
 * Retrieves transaction details based on the provided transaction hash.
 *
 * @param transactionHash - The transaction hash (prefixed with 0x).
 * @returns The transaction details.
 */
export const getTransactionDetails = async (transactionHash: `0x${string}`) => {
  const tx = await client.waitForTransactionReceipt({
    hash: transactionHash,
  });
  return tx;
};

/**
 * Adds a transaction record to the database.
 *
 * @param transaction - Transaction data conforming to solanaTransactionSchema.
 * @param from_user - The sender's details (wallet address and email).
 * @param to_user - The receiver's details (wallet address and email).
 * @param created_at - The timestamp for the transaction.
 * @returns The result of the database insert.
 */
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
    created_at: created_at,
  });
  if (error) {
    console.error("Error adding transaction to database", error);
    return;
  }
  return data;
};
