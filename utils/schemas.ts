import { z } from "zod";

/**
 * Transfer form schema (email and amount).
 * - Convert amount to number using z.coerce.number() so we can validate properly.
 * - Enforce a minimum positive amount (e.g. > 0).
 */
export const transferFormSchema = z.object({
  email: z.string().email({ message: "" }),
  amount: z.coerce
    .number({
      invalid_type_error: "Enter a number for the amount.",
    })
    .positive("The amount must be greater than 0."),
});

/**
 * Password form schema used to confirm the transaction.
 */
export const passwordFormSchema = z.object({
  password: z
    .string()
    .min(6, { message: "The password must be at least 6 characters long." }),
});

export const transactionReceiptSchema = z.object({
  blockHash: z.string(),
  blockNumber: z.bigint(),
  contractAddress: z.string().nullable(),
  cumulativeGasUsed: z.bigint(),
  effectiveGasPrice: z.bigint(),
  from: z.string(),
  gasUsed: z.bigint(),
  logs: z.array(z.unknown()),
  logsBloom: z.string(),
  status: z.string(),
  to: z.string().nullable(),
  transactionHash: z.string(),
  transactionIndex: z.number(),
  type: z.string(),
});

export const solanaTransactionSchema = z.object({
  from: z.string(),
  to: z.string(),
  amount: z.number(),
  signature: z.string(),
});
