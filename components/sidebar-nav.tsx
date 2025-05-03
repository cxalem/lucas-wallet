"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Users, List } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility like in Shadcn/UI
import { useI18n } from "@/locales/client";
import { I18nProviderClient } from "@/locales/client";

type NavItem = {
  nameKey: "nav.wallet" | "nav.contacts" | "nav.transactions";
  href: string;
  icon: React.ElementType;
};

const navigation: NavItem[] = [
  { nameKey: "nav.wallet", href: "/wallet", icon: Wallet },
  { nameKey: "nav.contacts", href: "/wallet/contacts", icon: Users },
  { nameKey: "nav.transactions", href: "/wallet/transactions", icon: List },
];

export function SidebarNav() {
  const pathname = usePathname();
  const t = useI18n();

  // Updated function to determine active state with nested paths
  const isActive = (href: string) => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const pathWithoutLocale =
      "/" +
      (pathSegments.length > 1
        ? pathSegments.slice(1).join("/")
        : pathSegments.join("/"));

    // Exact match required for the base /wallet route
    if (href === "/wallet") {
      return pathWithoutLocale === "/wallet";
    }

    // For nested routes, check if the path starts with the href
    // This correctly handles /wallet/contacts, /wallet/transactions and their sub-pages
    return pathWithoutLocale.startsWith(href);
  };

  return (
    <nav className="flex flex-col gap-2">
      {navigation.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.nameKey}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-semibold"
                : "text-gray-400 hover:bg-neutral-700 hover:text-[hsl(var(--sidebar-accent-foreground))]"
            )}
            aria-current={active ? "page" : undefined}
          >
            <item.icon className="h-5 w-5" />
            <span className="hidden md:inline">{t(item.nameKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
