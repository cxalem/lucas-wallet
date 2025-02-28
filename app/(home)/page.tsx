import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect("/wallet");
  }

  return (
    <section className=" z-50 grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] w-full">
      <div className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-12 items-center">
          <div>
            <h1 className="text-6xl font-black text-center">
              Envía y Recibe dinero
            </h1>
            <p className="text-center text-6xl font-thin">
              Cuando quieras, donde quieras
            </p>
          </div>
          <div className="bg-gradient-to-b from-red-600 via-yellow-600 to-purple-600 p-[.5px] rounded-lg w-full max-w-xl shadow-2xl shadow-yellow-600/30 ">
            <div className="flex flex-col gap-4 items-center bg-neutral-800 p-6 rounded-lg w-full max-w-xl">
              <div className="flex flex-col gap-3 bg-neutral-600 p-4 rounded-lg w-full">
                <span className="text-lg opacity-55 font-medium">
                  Saldo disponible
                </span>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold">$23.877</span>
                  <span className="text-sm opacity-55 font-medium">
                    USDT 23.867
                  </span>
                </div>
              </div>
              <Link href="/create-wallet" className="w-full">
                <Button className="w-full rounded-full bg-violet-600 px-10 py-2 text-zinc-50 font-medium hover:bg-violet-700">
                  Empieza ahora
                </Button>
              </Link>
              <p className="text-sm">
                Necesitas ingresar a tu cuenta para empezar a recibir dinero.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
