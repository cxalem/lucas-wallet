import Link from "next/link";
import LoginForm from "@/components/login-form";
export default async function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col gap-4 items-center mt-40">
      <div className="bg-gradient-to-b from-red-600 via-yellow-600 to-purple-600 p-[.5px] rounded-lg w-full max-w-xl shadow-2xl shadow-yellow-600/30 h-full">
        <LoginForm />
      </div>
      <p>
        No tienes una cuenta? <Link href="/create-wallet">Crea una cuenta</Link>
      </p>
    </div>
  );
}
