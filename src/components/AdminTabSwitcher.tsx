"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type AdminTab = "movies" | "persons" | "users";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "movies", label: "Movies" },
  { id: "persons", label: "Persons" },
  { id: "users", label: "Users" },
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
    `flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/70 p-1 text-sm font-medium text-zinc-300 ${className}`.trim();
  const baseClasses = "rounded-full px-4 py-2 transition";
  const activeClasses =
    "bg-indigo-500/20 text-indigo-100 shadow-[0_0_0_1px_rgba(99,102,241,0.35)]";
  const inactiveClasses =
    "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100";

  return (
    <div
      className={containerClasses}
      role="tablist"
      aria-label="Admin sections"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === (activeTab as AdminTab);
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
