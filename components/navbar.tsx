import Link from "next/link";
import LoginButton from "./login-button";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-2 md:px-0 py-8 w-full max-w-6xl mx-auto">
      <Link href="/" className="font-bold text-lg">
        <h1 className="text-2xl/7 font-black uppercase text-center">
          Lucas <br /> Wallet
        </h1>
      </Link>
      <LoginButton />
    </nav>
  );
}
