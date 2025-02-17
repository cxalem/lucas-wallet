import Link from "next/link";
import LoginButton from "./login-button";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 w-full">
      <Link href="/" className="font-bold text-lg">
        Lucas Wallet
      </Link>
      <LoginButton />
    </nav>
  );
}
