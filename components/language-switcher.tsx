"use client";
import { useChangeLocale, useCurrentLocale } from "@/locales/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { SupportedLocales } from "@/locales/types";

const languages: Record<SupportedLocales, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  pcm: "Pidgin",
  bn: "বাংলা",
};

export default function LanguageSwitcher() {
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-50/20">
        {Object.entries(languages).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLocale(code as SupportedLocales)}
            className={currentLocale === code ? "font-bold" : "hover:bg-neutral-800 cursor-pointer"}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
