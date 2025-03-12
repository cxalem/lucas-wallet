"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { useConnect, useAccount, useSignMessage } from "wagmi";
import { metaMask } from "wagmi/connectors";
import {
  generateNonce,
  verifySignature,
  isUserInDb,
} from "@/app/(home-login-register)/login/actions";
import { useRouter } from "next/navigation";

export const ConnectWalletButton = () => {
  const { connectAsync, isPending } = useConnect();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();

  const handleAuth = async () => {

    await connectAsync({ connector: metaMask() });

    try {
      if (!address) {
        throw new Error("Wallet address is required to authenticate.");
      }

      const nonce = await generateNonce(address);
      if (!nonce) {
        throw new Error("Failed to fetch nonce from server.");
      }

      const signature = await signMessageAsync({ message: nonce });

      if (!verifySignature(address, signature)) {
        throw new Error("Invalid signature");
      }

      const { isInDb, data, error } = await isUserInDb(address);

      if (!isInDb) {
        if (error === "User not found") {
          router.push(`/signup?address=${address}`);
        } else {
          // Other error (e.g. DB error)
          throw new Error(error ?? "Failed to verify user.");
        }
      }

      // At this point, the user is verified (or newly created).
      // You could retrieve a JWT, create a Supabase session, etc.
      // For instance, you could call an API route that verifies the signature
      // on the server and returns a Supabase session token.
      console.log("User verified! Data:", data || "User just created.");
    } catch (err) {
      console.error("Auth Error:", err);
      // Show error message to user, if desired
    }
  };

  return (
    <Button className="w-full bg-neutral-100 rounded-full" onClick={handleAuth}>
      <Image
        src="/metamask-logo.svg"
        alt="Connect Wallet"
        width={20}
        height={20}
      />{" "}
      {isPending
        ? "Connecting..."
        : isConnected
        ? address
        : "Login with MetaMask"}
    </Button>
  );
};
