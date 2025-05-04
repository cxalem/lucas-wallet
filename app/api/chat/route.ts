import { openai } from "@ai-sdk/openai";
import { streamText, tool, Message } from "ai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

// More specific message type with optional mentioned contacts
type LucasWalletMessage = Message & {
  mentionedContacts?: Array<{ id: string; name: string }>;
};

// Define the user data structure
type UserData = {
  walletAddress: string;
  [key: string]: unknown;
} | null;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Solana base-58 (32–44 bytes) quick check
const solAddressSchema = z
  .string()
  .min(32)
  .max(44)
  .regex(/^[1-9A-HJ-NP-Za-km-z]+$/, "Invalid base-58 string");

// Decimal string ≥ 0.000001 with max 6 dp
const amountSchema = z
  .string()
  .regex(/^(0|[1-9]\d*)(\.\d{1,6})?$/, "Invalid amount");

const extractUsernames = (text: string): string[] => {
  const matches = text.match(/\B@([a-z0-9_]{1,32})\b/gi) || [];
  return matches.map((m) => m.slice(1).toLowerCase());
};

const safeJson = (obj: unknown) => JSON.stringify(obj).replace(/[`<>]/g, "_");

const isDev = process.env.NODE_ENV !== "production";

// Get user by username from the database
const getUserByUsername = async (username: string) => {
  const supabase = await createClient();

  // Try to find the contact by username first
  const { data: contactData } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_name", username);

  if (contactData) {
    return contactData;
  }

  // If not found by username, try to find the user in profiles
  const { data: userData } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (userData) {
    return userData;
  }

  return null;
};

export async function POST(req: Request) {
  // ─── Parse body ────────────────────────────────────────────────────────────
  let messages: LucasWalletMessage[];
  try {
    ({ messages } = await req.json());
  } catch (err) {
    console.error("Error parsing JSON body:", err);
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  if (!Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "`messages` must be an array" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  if (isDev) {
    console.debug("First message:", messages[0]);
  }

  // ─── Collect @mentions, fetch user data in parallel ────────────────────────
  const usernames = new Set<string>();
  for (const m of messages) {
    if (m.role === "user" && typeof m.content === "string") {
      extractUsernames(m.content).forEach((u) => usernames.add(u));
    }
  }

  const userMetadata: Record<string, UserData> = Object.fromEntries(
    await Promise.all(
      [...usernames].map(async (u) => {
        try {
          const data = await getUserByUsername(u);
          return [u, data ?? null];
        } catch (e) {
          /* swallow—treat as missing */
          if (isDev) console.warn(`Lookup failed for @${u}:`, e);
          return [u, null];
        }
      })
    )
  );

  if (isDev) {
    console.debug("Extracted user metadata:", safeJson(userMetadata));
  }

  // ─── Build dynamic prompt chunk ────────────────────────────────────────────
  const profileLines = Object.entries(userMetadata)
    .filter(([, d]) => d)
    .map(([u, d]) => `- @${u}: ${safeJson({ wallet: d!.walletAddress })}`);

  const userDataPrompt = profileLines.length
    ? `### Available User Data
You have access to data for these users:
${profileLines.join("\n")}

When someone mentions one of these users, you can use their information (like wallet address) in your responses and transactions.`
    : "";

  // ─── Stream completion ─────────────────────────────────────────────────────
  const result = streamText({
    model: openai("gpt-4o"),
    system: `
      SYSTEM
      You are the Lucas Wallet AI assistant. Focus on Solana USDC transfers.
      Your job is to turn plain-language requests into safe, explicit wallet actions using the sendUSDC tool.

      Workflow
      1. Parse intent – Decide whether the user wants to send USDC on Solana.
      2. Collect details – Gather BOTH:
        • Recipient address – valid Solana address
        • Amount – accept 10.50, $10, 10$, 10 USDC (strip any $ as USDC)
        If either is missing, ask follow-up questions.
      3. Review summary – Present a summary THEN, after UI confirmation, generate the tool call.
      4. Tool-call – Only after a "confirmed": true flag from the client, call sendUSDC.
      5. Result – Relay tx-hash or error clearly.

      ${userDataPrompt}

      Style rules
      • Be friendly, polite, trustworthy.
      • Never reveal private keys or raw errors.
      • Never generate a tool call until UI confirmation is received.
      • Always include the full recipient Solana address.
      • By now, handle ONLY USDC on Solana.
`,
    messages,
    tools: {
      sendUSDC: tool({
        description: "Send USDC on Solana",
        parameters: z.object({
          to: solAddressSchema.describe("The recipient's Solana address"),
          amount: amountSchema.describe("The amount of USDC to send"),
          confirmed: z
            .boolean()
            .describe("UI flag that the user confirmed the transaction"),
        }),
        execute: async ({ to, amount, confirmed }) => {
          if (!confirmed) {
            return { error: "User has not confirmed" };
          }
          // 🔒 Place your real on-chain call here
          return { to, amount };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
