"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type AdminTab = "movies" | "persons" | "users" | "orders";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "movies", label: "Movies" },
  { id: "persons", label: "Persons" },
  { id: "users", label: "Users" },
  { id: "orders", label: "Orders" },
];

export default function AdminTabSwitcher({
  activeTab,
  className = "",
  onTabChange,
}: {
  activeTab: string;
  className?: string;
  onTabChange?: (tab: AdminTab) => void;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleTabClick = (nextTab: AdminTab) => {
    if (onTabChange) {
      onTabChange(nextTab);
      return;
    }

    const params = new URLSearchParams(searchParams);

    if (nextTab === "movies") {
      params.delete("tab");
    } else {
      params.set("tab", nextTab);
    }

    const query = params.toString();
    replace(query ? `${pathname}?${query}` : pathname);
  };

  const containerClasses =
    `flex items-center gap-1 px-4 rounded-full border border-border bg-card p-1 text-sm font-medium text-muted ${className}`.trim();
  const baseClasses =
    "rounded-full px-4 py-2 transition duration-150 bg-blue-500 text-white";
  const activeClasses = "bg-indigo-600 text-white font-bold shadow-md";
  const inactiveClasses =
    "bg-blue-500 text-white hover:bg-indigo-400 hover:text-white hover:shadow-sm";

  return (
    <div
      className={containerClasses}
      role="tablist"
      aria-label="Admin sections"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === (activeTab as AdminTab);
        return (
          <Button key={tab.id} asChild>
            <button
              type="button"
              role="tab"
              aria-selected={isActive ? "true" : "false"}
              className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          </Button>
        );
      })}
    </div>
  );
}
