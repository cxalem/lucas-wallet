"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

type CopyHashProps = {
  hash: string;
};

export function CopyHash({ hash }: CopyHashProps) {
  // Create a truncated version, e.g. 0x1234...abcd
  const truncatedHash = `${hash.slice(0, 6)}...${hash.slice(-6)}`;

  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setIsCopied(true);

      // Automatically hide the “Copied!” message after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy hash:", error);
    }
  };

  return (
    <span
      title={hash} // Show full hash on hover
      onClick={copyToClipboard}
      className="cursor-pointer flex items-center gap-1 text-blue-50/70 hover:text-blue-50 transition-all duration-150"
    >
      <CheckIcon
        className={`duration-300 text-green-500 w-4 h-4 ${
          isCopied ? "opacity-100" : "opacity-0"
        }`}
      />
      <CopyIcon className="w-4 h-4" />

      {truncatedHash}
    </span>
  );
}
