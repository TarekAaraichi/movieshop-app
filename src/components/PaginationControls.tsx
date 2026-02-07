"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalCount: number;
  pageSize: number;
  basePath: string;
}

export default function PaginationControls({
  hasNextPage,
  hasPrevPage,
  totalCount,
  pageSize,
  basePath,
}: PaginationControlsProps) {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? "1";
  const per_page = searchParams.get("per_page") ?? pageSize.toString();

  const pageCount = Math.ceil(totalCount / Number(per_page));
  const currentPage = Number(page);

  const getPageLink = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", p.toString());
    return `${basePath}?${params.toString()}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const ellipsis = (
      <span key="ellipsis" className="px-4 py-2">
        ...
      </span>
    );

    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) {
        pages.push(
          <Link
            key={i}
            href={getPageLink(i)}
            className={`px-4 py-2 rounded-md ${
              currentPage === i
                ? "bg-blue-500 text-white dark:bg-blue-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {i}
          </Link>,
        );
      }
    } else {
      pages.push(
        <Link
          key={1}
          href={getPageLink(1)}
          className={`px-4 py-2 rounded-md ${
            currentPage === 1
              ? "bg-blue-500 text-white dark:bg-blue-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          1
        </Link>,
      );

      if (currentPage > 3) {
        pages.push(ellipsis);
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(pageCount - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <Link
            key={i}
            href={getPageLink(i)}
            className={`px-4 py-2 rounded-md ${
              currentPage === i
                ? "bg-blue-500 text-white dark:bg-blue-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {i}
          </Link>,
        );
      }

      if (currentPage < pageCount - 2) {
        pages.push(ellipsis);
      }

      pages.push(
        <Link
          key={pageCount}
          href={getPageLink(pageCount)}
          className={`px-4 py-2 rounded-md ${
            currentPage === pageCount
              ? "bg-blue-500 text-white dark:bg-blue-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          {pageCount}
        </Link>,
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-8 text-gray-800 dark:text-white">
      <Link
        href={getPageLink(currentPage - 1)}
        className={`px-4 py-2 rounded-md ${
          !hasPrevPage
            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        }`}
        aria-disabled={!hasPrevPage}
      >
        Previous
      </Link>

      <div className="flex items-center gap-2">{renderPageNumbers()}</div>

      <Link
        href={getPageLink(currentPage + 1)}
        className={`px-4 py-2 rounded-md ${
          !hasNextPage
            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        }`}
        aria-disabled={!hasNextPage}
      >
        Next
      </Link>
    </div>
  );
}
