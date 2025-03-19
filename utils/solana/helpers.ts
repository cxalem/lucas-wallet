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
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { USDC_MINT_ADDRESS } from "../constants";
import base64 from "base64-js";

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

export async function transferSolana(
  from: Keypair,
  to: PublicKey,
  amount: number
) {
  const connection = new Connection(
    "https://go.getblock.io/ac564b707a87486092ed81f6cdcb2a4b",
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

export const sendSolanaTransaction = async (
  from: Keypair,
  to: PublicKey,
  amount: number
) => {
  const connection = new Connection(
    "https://go.getblock.io/ac564b707a87486092ed81f6cdcb2a4b",
    "confirmed"
  );

  const transaction = new Transaction();

  const usdcMint = new PublicKey(USDC_MINT_ADDRESS);

  const senderTokenAccount = await getAssociatedTokenAddress(
    usdcMint,
    from.publicKey
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

  transaction.recentBlockhash = (
    await connection.getLatestBlockhash("finalized")
  ).blockhash;
  transaction.feePayer = from.publicKey;
  transaction.sign(from);

  const serializedTransaction = transaction.serialize();
  const base64Transaction = base64.fromByteArray(serializedTransaction);

  await getSenderAccountInfo(connection, senderTokenAccount, from);

  const response = await fetch(
    "https://go.getblock.io/ac564b707a87486092ed81f6cdcb2a4b",
    {
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
    }
  );

  const result = await response.json();

  return result.result;
};
