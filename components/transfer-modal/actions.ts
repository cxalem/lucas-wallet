"use server";

// ======== External Libraries ========
import base64 from "base64-js";
import { z } from "zod";

// ======== Blockchain Libraries ========
import { Connection, PublicKey, Keypair, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";

// ======== Local Modules ========
import { decryptData } from "@/app/[locale]/security/encrypt";
import { createClient } from "@/utils/supabase/server";
import { solanaTransactionSchema } from "@/utils/schemas";
import { USDC_MINT_ADDRESS } from "@/utils/constants";

// ======== Constants ========
const USDC_DECIMALS = 6;
const MIN_SOL_BALANCE_LAMPORTS = 5000;
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_GO_GETBLOCK_URL;
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

if (!SOLANA_RPC_URL) {
  console.error("Missing SOLANA_RPC_URL environment variable");
}
if (!ALCHEMY_API_KEY) {
  console.warn(
    "Missing NEXT_PUBLIC_ALCHEMY_API_KEY environment variable, getUsdcBalance may fail."
  );
}

// ======== Connection Helper ========
let connectionInstance: Connection | null = null;

/**
 * Gets a singleton Solana Connection instance.
 * @returns The Solana Connection instance.
 */
const getSolanaConnection = (): Connection => {
  if (!SOLANA_RPC_URL) {
    throw new Error("Solana RPC URL is not configured.");
  }
  if (!connectionInstance) {
    connectionInstance = new Connection(SOLANA_RPC_URL, "confirmed");
  }
  return connectionInstance;
};

// ======== Custom Error Classes ========
class InsufficientSolError extends Error {
  constructor(
    message = "Sender does not have enough SOL to pay for transaction fees."
  ) {
    super(message);
    this.name = "InsufficientSolError";
  }
}

class ZeroUsdcBalanceError extends Error {
  constructor(message = "Sender has 0 USDC in their token account.") {
    super(message);
    this.name = "ZeroUsdcBalanceError";
  }
}

class InvalidRecipientPublicKeyError extends Error {
  constructor(message = "Invalid recipient address format.") {
    super(message);
    this.name = "InvalidRecipientPublicKeyError";
  }
}

class TransactionFailedError extends Error {
  constructor(message: string) {
    super(`Transaction failed: ${message}`);
    this.name = "TransactionFailedError";
  }
}

// ======== Helper Functions ========

/**
 * Validates the sender's account info before processing a transaction.
 * Checks for sufficient SOL for fees and ensures the sender has USDC.
 *
 * @param connection - The Solana connection instance.
 * @param senderTokenAccount - The sender's associated USDC token account.
 * @param from - The sender's Keypair.
 * @throws {InsufficientSolError} If sender SOL balance is too low.
 * @throws {ZeroUsdcBalanceError} If sender USDC balance is zero.
 * @throws {Error} For otherSPL or connection errors.
 */
const validateSenderAccountInfo = async (
  connection: Connection,
  senderTokenAccount: PublicKey,
  senderKeypair: Keypair
) => {
  const senderAccountInfo = await getAccount(connection, senderTokenAccount);
  const senderSolBalance = await connection.getBalance(senderKeypair.publicKey);

  if (senderSolBalance < MIN_SOL_BALANCE_LAMPORTS) {
    throw new InsufficientSolError(
      `Sender SOL balance (${senderSolBalance}) is less than required minimum (${MIN_SOL_BALANCE_LAMPORTS}).`
    );
  }
  if (senderAccountInfo.amount === BigInt(0)) {
    throw new ZeroUsdcBalanceError();
  }
};

/**
 * Gets the associated token account addresses for sender and receiver.
 * @internal Internal helper function.
 */
async function _getAssociatedTokenAccountAddresses(
  mint: PublicKey,
  senderPublicKey: PublicKey,
  recipientPublicKey: PublicKey
): Promise<{ senderTokenAccount: PublicKey; receiverTokenAccount: PublicKey }> {
  const senderTokenAccount = await getAssociatedTokenAddress(
    mint,
    senderPublicKey
  );
  const receiverTokenAccount = await getAssociatedTokenAddress(
    mint,
    recipientPublicKey
  );
  return { senderTokenAccount, receiverTokenAccount };
}

/**
 * Checks if a token account exists and adds a create instruction if it doesn't.
 * @internal Internal helper function.
 */
async function _addCreateTokenAccountInstructionIfNeeded(
  transaction: Transaction,
  connection: Connection,
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  associatedTokenAddress: PublicKey
): Promise<void> {
  try {
    await getAccount(connection, associatedTokenAddress);
    // Account already exists, do nothing
  } catch (error: unknown) {
    // Assuming error means account doesn't exist (common case)
    // Consider more specific error checking (e.g., TokenAccountNotFoundError) if library provides it
    console.log(
      `Token account ${associatedTokenAddress.toBase58()} for owner ${owner.toBase58()} does not exist. Adding create instruction.`
    );
    console.log(error);
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer, // Payer
        associatedTokenAddress, // ATA address
        owner, // Owner
        mint // Mint
      )
    );
  }
}

/**
 * Adds the SPL Token transfer instruction for USDC.
 * @internal Internal helper function.
 */
function _addUsdcTransferInstruction(
  transaction: Transaction,
  senderTokenAccount: PublicKey,
  receiverTokenAccount: PublicKey,
  senderPublicKey: PublicKey, // Authority
  amountInUsdcUnits: number
): void {
  const amountInLamports = BigInt(
    Math.round(amountInUsdcUnits * 10 ** USDC_DECIMALS)
  );
  if (amountInLamports <= 0) {
    throw new Error("Transfer amount must be positive.");
  }

  transaction.add(
    createTransferInstruction(
      senderTokenAccount,
      receiverTokenAccount,
      senderPublicKey, // Authority
      amountInLamports
    )
  );
}

// ======== Transaction Functions ========

/**
 * Sends a USDC transaction on Solana by manually serializing the transaction
 * and posting it to the network via RPC.
 *
 * @param fromSecretKeyBytes - The sender's secret key as Uint8Array.
 * @param toAddress - The receiver's wallet address as a string.
 * @param amountInUsdcUnits - The amount of USDC tokens to transfer (in USDC units).
 * @returns The transaction signature string from the network.
 * @throws {InvalidRecipientPublicKeyError} If toAddress is invalid.
 * @throws {InsufficientSolError} If sender SOL balance is too low.
 * @throws {ZeroUsdcBalanceError} If sender USDC balance is zero.
 * @throws {TransactionFailedError} If the RPC call returns an error.
 * @throws {Error} For other configuration or network issues.
 */
export const sendSolanaTransaction = async (
  fromSecretKeyBytes: Uint8Array,
  toAddress: string,
  amountInUsdcUnits: number
): Promise<string> => {
  const connection = getSolanaConnection();

  let recipientPublicKey: PublicKey;
  try {
    recipientPublicKey = new PublicKey(toAddress);
  } catch (e) {
    console.error(
      "Invalid recipient public key string passed to server action:",
      toAddress,
      e
    );
    throw new InvalidRecipientPublicKeyError();
  }

  const transaction = new Transaction();
  const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
  const senderKeypair = Keypair.fromSecretKey(fromSecretKeyBytes);

  // Get ATAs using helper
  const { senderTokenAccount, receiverTokenAccount } =
    await _getAssociatedTokenAccountAddresses(
      usdcMint,
      senderKeypair.publicKey,
      recipientPublicKey
    );

  // Add create instruction for receiver if needed, using helper
  await _addCreateTokenAccountInstructionIfNeeded(
    transaction,
    connection,
    senderKeypair.publicKey, // Payer
    recipientPublicKey, // Owner
    usdcMint,
    receiverTokenAccount
  );

  // Add transfer instruction using helper
  _addUsdcTransferInstruction(
    transaction,
    senderTokenAccount,
    receiverTokenAccount,
    senderKeypair.publicKey, // Authority
    amountInUsdcUnits
  );

  // Validate sender balance *before* signing and sending
  await validateSenderAccountInfo(
    connection,
    senderTokenAccount,
    senderKeypair
  );

  // Get recent blockhash and set fee payer
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash("finalized")
  ).blockhash;
  transaction.feePayer = senderKeypair.publicKey;

  // Sign the transaction
  transaction.sign(senderKeypair);

  // Serialize and send
  const serializedTransaction = transaction.serialize();
  const base64Transaction = base64.fromByteArray(serializedTransaction);

  console.log("Sending transaction...");
  const response = await fetch(SOLANA_RPC_URL!, {
    // Use centralized URL
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
          skipPreflight: false,
          preflightCommitment: "confirmed",
          maxRetries: 5,
        },
      ],
    }),
  });

  const result = await response.json();

  if (result.error) {
    console.error("Error sending transaction:", result.error);
    throw new TransactionFailedError(result.error.message || "RPC Error");
  }

  if (!result.result || typeof result.result !== "string") {
    console.error("Unexpected response from sendTransaction:", result);
    throw new Error(
      "Failed to send transaction: Invalid response from RPC node."
    );
  }

  console.log(`Transaction sent via RPC. Signature: ${result.result}`);
  return result.result; // Return the signature string
};

// ======== Balance Functions ========

/**
 * Retrieves the user's USDC token balance on Solana.
 *
 * @returns A promise resolving to the USDC balance (number) or 0 on error/not found.
 */
export const getUsdcBalance = async (): Promise<number> => {
  if (!ALCHEMY_API_KEY) {
    console.error("Cannot fetch USDC balance: Alchemy API Key is missing.");
    return 0;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error getting user for USDC balance:", userError);
    return 0;
  }

  const walletAddress = user.user_metadata?.wallet_address;
  if (!walletAddress) {
    console.error(
      "User metadata does not contain wallet_address for USDC balance."
    );
    return 0;
  }

  // Use a separate connection for Alchemy endpoint
  const alchemyRpcUrl = `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
  const alchemyConnection = new Connection(alchemyRpcUrl, "confirmed");

  try {
    const publicKey = new PublicKey(walletAddress);
    const usdcMint = new PublicKey(USDC_MINT_ADDRESS);

    // Use getParsedTokenAccountsByOwner for easier balance extraction
    const tokenAccounts = await alchemyConnection.getParsedTokenAccountsByOwner(
      publicKey,
      { mint: usdcMint }
    );

    // Check if the array has accounts and the first account has the necessary data
    const accountInfo = tokenAccounts?.value?.[0]?.account?.data?.parsed?.info;
    const usdcBalance = accountInfo?.tokenAmount?.uiAmount ?? 0;

    console.log(`USDC Balance for ${walletAddress}: ${usdcBalance}`);
    return usdcBalance;
  } catch (e) {
    // Catch potential PublicKey errors or connection issues
    console.error(`Error fetching USDC balance for ${walletAddress}:`, e);
    return 0; // Return 0 on error
  }
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
