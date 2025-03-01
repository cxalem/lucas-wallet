"use client";

import Link from "next/link";
import LoginButton from "@/components/login-button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { login } from "@/app/(home-login-register)/login/actions";
export default function LoginForm() {
  const [inputError, setInputError] = useState<{
    type: "email" | "password" | null;
    message: string | null;
  }>({
    type: null,
    message: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const loginFormSchema = z.object({
    email: z.string().email({ message: "Ingresa un email válido." }),
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
  });

  const { register } = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
  });

  const handleLogin = async (formData: FormData) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", formData.get("email"));

    if (!data || data.length === 0) {
      setInputError({
        type: "email",
        message: "No se encontró un usuario con ese email.",
      });
      return;
    }

    setIsLoading(true);

    const result = await login(formData);

    if (result.error) {
      setIsLoading(false);
      if (result.status === 400) {
        setInputError({
          type: "password",
          message: "La contraseña es incorrecta.",
        });
      }
      return;
    }
    setIsLoading(false);
  };

  return (
    <form className="flex flex-col gap-6 items-center justify-center w-full mx-auto bg-neutral-800 px-10 md:px-20 py-16 rounded-lg h-full">
      <div className="flex flex-col gap-2 items-center">
        <Link href="/" className="text-lg">
          <h1 className="text-4xl/9 font-black uppercase text-center">
            Lucas <br /> Wallet
          </h1>
        </Link>
        {inputError.type === "email" || inputError.type === "password" ? (
          <p className={`text-red-400 text-sm}`}>
            Error iniciando sesión, por favor intenta de nuevo
          </p>
        ) : (
          <p className="max-w-md text-center">
            Inicia sesión para ver tus Lucas
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1 w-full max-w-md">
        <label htmlFor="email">Email:</label>
        <Input
          {...register("email")}
          className={`bg-neutral-700 border-transparent w-full`}
          onChange={() => setInputError({ type: null, message: null })}
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          required
        />
        {inputError.type === "email" && (
          <p className="text-red-500 text-sm">{inputError.message}</p>
        )}
        <label htmlFor="password">Password:</label>
        <Input
          {...register("password")}
          className={`bg-neutral-700 border-transparent w-full`}
          onChange={() => setInputError({ type: null, message: null })}
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          required
        />
      </div>
      <LoginButton
        type="login"
        isLoading={isLoading}
        handleLogin={handleLogin}
      />
    </form>
  );
}
