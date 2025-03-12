import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginButton({
  type = "link",
  handleLogin,
  isLoading,
}: {
  type?: "login" | "link";
  handleLogin?: (formData: FormData) => Promise<void>;
  isLoading?: boolean;
}) {
  if (type === "login") {
    return (
      <Button
        formAction={handleLogin}
        className="bg-violet-600 px-10 py-2 rounded-full text-zinc-50 font-medium hover:bg-violet-700 w-full"
      >
        {isLoading ? "Loading..." : "Login"}
      </Button>
    );
  }

  return (
    <Link href="/login">
      <Button className="bg-violet-600 px-10 py-2 rounded-full text-zinc-50 font-medium hover:bg-violet-700 shadow-lg">
        Send money
      </Button>
    </Link>
  );
}
