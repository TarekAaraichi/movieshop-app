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
    `flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-sm font-medium text-gray-600 dark:border-gray-800/70 dark:bg-gray-900/60 dark:text-gray-400 ${className}`.trim();
  const baseClasses = "rounded-full px-4 py-2 transition";
  const activeClasses =
    "bg-indigo-100 text-indigo-700 shadow-sm dark:bg-white/15 dark:text-white dark:shadow-[0_0_0_1px_rgba(255,255,255,0.15)]";
  const inactiveClasses =
    "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-100";

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
