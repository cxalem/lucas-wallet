import Link from "next/link";

export default function LoginButton() {
  return (
    <Link
      className="bg-neutral-800 px-6 py-2 rounded-md text-zinc-50 font-medium"
      href="/login"
    >
      Login
    </Link>
  );
}
