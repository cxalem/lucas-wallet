import { Button } from "@/components/ui/button";
import { login } from "./actions";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col gap-4 items-center mt-52">
      <Link href="/" className="text-2xl text-sky-500 font-bold mb-10">
        LUCAS
      </Link>
      <h2 className="text-5xl font-bold mb-10 max-w-md text-center">
        Inicia sesión para ver tus Lucas
      </h2>
      <form className="flex flex-col gap-4 items-center justify-center w-full mx-auto">
        <div className="flex flex-col gap-2 w-full max-w-md">
          <label htmlFor="email">Email:</label>
          <Input id="email" name="email" type="email" required />
          <label htmlFor="password">Password:</label>
          <Input id="password" name="password" type="password" required />
          <Button formAction={login}>
            Log in
          </Button>
        </div>
      </form>
      <p>
        No tienes una cuenta? <Link href="/create-wallet">Crea una cuenta</Link>
      </p>
    </div>
  );
}
