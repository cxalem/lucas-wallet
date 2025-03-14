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
    <section className="z-50 grid grid-rows-[20px_1fr_20px] items-center justify-items-center md:p-8 pb-20 gap-16 font-[family-name:var(--font-geist-sans)] w-full">
      <div className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-12 items-center">
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-6xl font-bold md:font-black text-center">
              Send and Receive Money
            </h1>
            <p className="text-center text-3xl md:text-6xl font-thin">
              When you want, where you want
            </p>
          </div>
          <div className="p-2 w-full flex justify-center">
            <div className="bg-gradient-to-b from-red-600 via-yellow-600 to-purple-600 p-[1px] rounded-lg w-full max-w-xl shadow-2xl shadow-yellow-600/30 ">
              <div className="flex flex-col gap-4 items-center bg-neutral-800 p-6 rounded-lg w-full max-w-xl">
                <div className="flex flex-col gap-3 bg-neutral-600 p-4 rounded-lg w-full">
                  <span className="text-lg opacity-55 font-medium">
                    Available balance
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
                    Start now
                  </Button>
                </Link>
                <p className="text-sm text-center">
                  You need to enter your account to start receiving money.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
