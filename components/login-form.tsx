"use client";

import Link from "next/link";
import LoginButton from "@/components/login-button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { login } from "@/app/[locale]/(home-login-register)/login/actions";
import { useI18n } from "@/locales/client";

export default function LoginForm() {
  const t = useI18n();
  const [inputError, setInputError] = useState<{
    type: "email" | "password" | "email-or-username" | null;
    message: string | null;
  }>({
    type: null,
    message: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const loginFormSchema = z.object({
    email: z.string().email({ message: t("login.form.validation.email") }),
    password: z
      .string()
      .min(8, { message: t("login.form.validation.password") }),
  });

  const { register } = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
  });

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    const emailOrUsername = formData.get("email-or-username")?.toString();

    if (!emailOrUsername) {
      setInputError({
        type: "email-or-username",
        message: t("login.form.error.required"),
      });
      return;
    }

    let userEmail = emailOrUsername;

    // If input is a username, fetch the associated email
    if (!emailOrUsername.includes("@")) {
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_name", emailOrUsername)
        .single();

      if (error || !data) {
        setInputError({
          type: "email-or-username",
          message: t("login.form.error.usernameNotFound"),
        });
        setIsLoading(false);
        return;
      }

      userEmail = data.email;
      setIsLoading(false);
    }

    setIsLoading(true);

    // Construct formData with the correct email
    const updatedFormData = new FormData();
    updatedFormData.append("email", userEmail);
    updatedFormData.append("password", formData.get("password") as string);

    // Attempt login
    const result = await login(updatedFormData);

    setIsLoading(false);

    if (result.error) {
      if (result.status === 400) {
        setInputError({
          type: "password",
          message: t("login.form.error.password"),
        });
      }
      return;
    }
  };

  return (
    <form className="flex flex-col gap-6 items-center justify-center w-full mx-auto bg-neutral-800 px-10 md:px-20 py-16 rounded-lg h-full">
      <div className="flex flex-col gap-2 items-center">
        <Link href="/" className="text-lg">
          <h1 className="text-4xl/9 font-black uppercase text-center">
            {t("login.form.title")}
          </h1>
        </Link>
        {inputError.type === "email" || inputError.type === "password" ? (
          <p className={`text-red-400 text-sm}`}>{t("login.form.error")}</p>
        ) : (
          <p className="max-w-md text-center">{t("login.form.description")}</p>
        )}
      </div>
      <div className="flex flex-col gap-1 w-full max-w-md">
        <label htmlFor="email-or-username">
          {t("login.form.email-or-username.label")}
        </label>
        <Input
          {...register("email")}
          className={`bg-neutral-700 border-transparent w-full`}
          onChange={() => setInputError({ type: null, message: null })}
          id="email-or-username"
          name="email-or-username"
          type="text"
          placeholder={t("login.form.email-or-username.placeholder")}
          required
        />
        {inputError.type === "email-or-username" ? (
          <p className="text-red-500 text-sm">{inputError.message}</p>
        ) : inputError.type === "email" ? (
          <p className="text-red-500 text-sm">{inputError.message}</p>
        ) : (
          <label htmlFor="password">{t("login.form.password.label")}</label>
        )}
        <Input
          {...register("password")}
          className={`bg-neutral-700 border-transparent w-full`}
          onChange={() => setInputError({ type: null, message: null })}
          id="password"
          name="password"
          type="password"
          placeholder={t("login.form.password.placeholder")}
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
