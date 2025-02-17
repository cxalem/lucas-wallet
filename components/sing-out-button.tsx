"use client";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";

export const SignOutButton = () => {
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut({ scope: "local" });
    redirect("/");
  };

  return (
    <Button className="font-semibold" onClick={signOut}>
      Cerrar sesión
    </Button>
  );
};
