"use client";

import { Input } from "../ui/input";
import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useI18n } from "@/locales/client";

export function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const t = useI18n();
  
  // Handle input change
  const handleSearch = (term: string) => {
    setSearchValue(term);
    
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    
    // Update URL with search param
    replace(`${pathname}?${params.toString()}`);
  };
  
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={t("contacts.search.placeholder") || "Search contacts..."}
        className="w-full px-4 py-2 pl-10 bg-neutral-900 border border-neutral-800 rounded-lg text-white"
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
      </div>
    </div>
  );
}
