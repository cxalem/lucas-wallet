import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ChatHeader() {
  return (
    <CardHeader className="border-b border-zinc-700">
      <CardTitle className="flex items-center gap-2">
        <h2 className="text-zinc-100">Lucas Assistant</h2>
      </CardTitle>
      <CardDescription className="text-zinc-400">
        This assistant will help you to execute transactions like buying crypto,
        sending payments, and more.
      </CardDescription>
    </CardHeader>
  );
}
