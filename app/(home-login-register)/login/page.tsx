import Link from "next/link";
import LoginForm from "@/components/login-form";
import { ConnectWalletButton } from "@/components/connect-wallet-button";

export default async function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col gap-4 items-center mt-28">
      <div className="bg-gradient-to-b from-red-600 via-yellow-600 to-purple-600 p-[1px] rounded-lg w-full max-w-xl shadow-2xl shadow-yellow-600/30 h-full">
        <div className="w-full mx-auto bg-neutral-800 px-10 md:px-20 py-16 rounded-lg h-full">
          <LoginForm />
          <div className="flex flex-col gap-3 items-center mt-3">
            <p>Or</p>
            <ConnectWalletButton />
          </div>
        </div>
      </div>
      <p>
        No tienes una cuenta? <Link href="/create-wallet">Crea una cuenta</Link>
      </p>
    </div>
  );
}
