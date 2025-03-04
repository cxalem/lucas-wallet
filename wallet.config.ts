import { createPublicClient, createWalletClient, http } from "viem";
import { createConfig } from "wagmi";
import { privateKeyToAccount } from "viem/accounts";
import { lineaSepolia } from "viem/chains";

export const client = createPublicClient({
  chain: lineaSepolia,
  transport: http(),
});

export const walletClient = (privateKey: `0x${string}`) =>
  createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: lineaSepolia,
    transport: http(),
  });

export const config = createConfig({
  chains: [lineaSepolia],
  transports: {
    [lineaSepolia.id]: http(),
  },
  ssr: true,
});
