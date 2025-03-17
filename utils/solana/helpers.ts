import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";
import { USDC_MINT_ADDRESS } from "../constants";

export async function transferSolana(
  from: Keypair,
  to: PublicKey,
  amount: number
) {
  const connection = new Connection(
    `https://api.mainnet-beta.solana.com`,
    "confirmed"
  );

  const senderTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(USDC_MINT_ADDRESS),
    from.publicKey
  );
  const receiverTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(USDC_MINT_ADDRESS),
    new PublicKey(to)
  );

  const transaction = new Transaction().add(
    createTransferInstruction(
      senderTokenAccount,
      receiverTokenAccount,
      from.publicKey,
      amount * 1e6 // USDC has 6 decimal places (1.5 USDC = 1,500,000 units)
    )
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);

  console.log(`✅ USDC sent! Transaction Signature: ${signature}`);

  return signature;
}
