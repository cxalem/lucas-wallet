import { Button } from "@/components/ui/button";
import { signup } from "./actions";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function CreateWalletPage() {
  return (
    <div className="min-h-screen flex flex-col gap-4 items-center mt-16">
      <div className="bg-gradient-to-b from-red-600 via-yellow-600 to-purple-600 p-[.5px] rounded-lg w-full max-w-xl shadow-2xl shadow-yellow-600/30 ">
        <form className="flex flex-col gap-6 items-center backdrop-blur-sm justify-center mx-auto bg-neutral-800 px-16 py-16 rounded-lg w-full max-w-xl">
          <div className="flex flex-col gap-2 items-center">
            <Link href="/" className="text-lg">
              <h1 className="text-4xl/9 font-black uppercase text-center">
                Lucas <br /> Wallet
              </h1>
            </Link>
            <p className="text-center text-sm">
              Crea tu cuenta para empezar a recibir dinero.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-sm">
            <label htmlFor="email">Email:</label>
            <Input
              className="bg-neutral-700 border-none w-full"
              placeholder="Ingresa tu email"
              id="email"
              name="email"
              type="email"
              required
            />
            <label htmlFor="password">Contraseña:</label>
            <Input
              className="bg-neutral-700 border-none w-full"
              placeholder="Ingresa tu contraseña"
              id="password"
              name="password"
              type="password"
              required
            />
            <label htmlFor="first_name">Nombre:</label>
            <Input
              className="bg-neutral-700 border-none w-full"
              placeholder="Ingresa tu nombre"
              id="first_name"
              name="first_name"
              type="text"
              required
            />
            <label htmlFor="last_name">Apellido:</label>
            <Input
              className="bg-neutral-700 border-none w-full"
              placeholder="Ingresa tu apellido"
              id="last_name"
              name="last_name"
              type="text"
              required
            />

            <label htmlFor="phone">Teléfono:</label>
            <Input
              className="bg-neutral-700 border-none w-full"
              placeholder="Ingresa tu teléfono"
              id="phone"
              name="phone"
            />
          </div>
          <Button
            className="bg-violet-600 hover:bg-violet-700 w-full text-blue-50 rounded-full max-w-sm"
            formAction={signup}
          >
            Crear cuenta
          </Button>
        </form>
      </div>
      <p>
        Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
