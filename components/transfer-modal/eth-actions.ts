"use server";

// ======== External Libraries ========
import { formatEther } from "viem";

// ======== Local Modules ========
import { createClient } from "@/utils/supabase/server";
import { client } from "@/wallet.config";

// ======== Balance Functions ========

/**
 * Retrieves the user's native wallet balance (e.g., ETH) using Supabase auth and Viem client.
 * Assumes `client` is configured for the native chain.
 *
 * @returns A promise resolving to the formatted wallet balance (first 5 characters) or undefined on error.
 */
export const getUserNativeBalance = async (): Promise<string | undefined> => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error getting user or user not found:", userError);
    return undefined;
  }

  const walletAddress = user.user_metadata?.wallet_address;
  if (!walletAddress) {
    console.error("User metadata does not contain wallet_address.");
    return undefined;
  }

  try {
    // Assuming `client` is the viem client instance imported from @/wallet.config
    const balance = await client.getBalance({
      address: walletAddress as `0x${string}`, // Cast needed for viem
    });
    const formattedBalance = formatEther(balance);
    return formattedBalance.slice(0, 5); // Keep the slicing for now
  } catch (balanceError) {
    console.error(
      `Error fetching native balance for ${walletAddress}:`,
      balanceError
    );
    return undefined;
  }
};

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