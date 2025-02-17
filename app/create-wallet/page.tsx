import { Button } from "@/components/ui/button";
import { signup } from "./actions";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function CreateWalletPage() {
  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center">
      <form className="flex flex-col gap-4 items-center justify-center w-full mx-auto">
        <div className="flex flex-col gap-2 w-full max-w-md">
          <label htmlFor="email">Email:</label>
          <Input id="email" name="email" type="email" required />
          <label htmlFor="password">Contraseña:</label>
          <Input id="password" name="password" type="password" required />
          <label htmlFor="first_name">Nombre:</label>
          <Input id="first_name" name="first_name" type="text" required />
          <label htmlFor="last_name">Apellido:</label>
          <Input id="last_name" name="last_name" type="text" required />
          <Button formAction={signup}>
            Crear cuenta
          </Button>
        </div>
      </form>
      <p>
        Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
