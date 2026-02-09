"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  containerId: string;
}

export default function CarouselControls({ containerId }: Props) {
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // (no autoplay) — keep controls manual only

  const scroll = useCallback(
    (dir: number) => {
      const el = document.getElementById(containerId) as HTMLElement | null;
      if (!el) return;

      const children = Array.from(el.children) as HTMLElement[];
      if (children.length === 0) return;

      const visibleIndex = children.findIndex((c) => {
        const rect = c.getBoundingClientRect();
        const parentRect = el.getBoundingClientRect();
        return (
          rect.left >= parentRect.left - 1 && rect.left < parentRect.right - 1
        );
      });

      let targetIndex = 0;
      if (visibleIndex === -1) {
        targetIndex = dir > 0 ? 0 : children.length - 1;
      } else {
        targetIndex = Math.min(
          Math.max(visibleIndex + dir, 0),
          children.length - 1,
        );
      }

      const target = children[targetIndex];
      if (!target) return;

      const parentRect = el.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      const delta = rect.left - parentRect.left;
      const newLeft = Math.round(el.scrollLeft + delta);
      el.scrollTo({ left: newLeft, behavior: "smooth" });

      setTimeout(() => {
        const childrenAfter = Array.from(el.children) as HTMLElement[];
        const parentRectAfter = el.getBoundingClientRect();
        const vis = childrenAfter.findIndex((child) => {
          const rectAfter = child.getBoundingClientRect();
          return (
            rectAfter.left >= parentRectAfter.left - 1 &&
            rectAfter.left < parentRectAfter.right - 1
          );
        });
        const idxAfter = vis === -1 ? targetIndex : vis;
        const gapStr =
          getComputedStyle(el).gap || getComputedStyle(el).columnGap || "0px";
        const gap = parseFloat(gapStr) || 0;
        const firstRect = childrenAfter[0]?.getBoundingClientRect();
        const itemFullWidth = firstRect
          ? firstRect.width + gap
          : el.clientWidth;
        const visibleCountAfter = Math.max(
          1,
          Math.floor(el.clientWidth / itemFullWidth),
        );
        const pagesAfter = Math.max(
          1,
          childrenAfter.length - visibleCountAfter + 1,
        );
        const pageAfter = Math.min(idxAfter, Math.max(0, pagesAfter - 1));
        setAnnouncement(`Showing ${pageAfter + 1} of ${pagesAfter}`);
        setCurrentIndex(idxAfter);
        setTotalCount(childrenAfter.length);
        setTotalPages(pagesAfter);
        setCurrentPage(pageAfter);
      }, 350);
    },
    [containerId],
  );

  useEffect(() => {
    const el = document.getElementById(containerId) as HTMLElement | null;
    if (!el) return;

    const update = () => {
      setCanLeft(el.scrollLeft > 0);
      setCanRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 1);

      // update announcement for screen readers
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length === 0) {
        setAnnouncement("");
        setCurrentIndex(0);
        setTotalCount(0);
        return;
      }
      // compute pagination (how many distinct "pages" of items fit in the viewport)
      const gapStr =
        getComputedStyle(el).gap || getComputedStyle(el).columnGap || "0px";
      const gap = parseFloat(gapStr) || 0;
      const firstRect = children[0].getBoundingClientRect();
      const itemFullWidth = firstRect.width + gap;
      const visibleCount = Math.max(
        1,
        Math.floor(el.clientWidth / itemFullWidth),
      );
      const pages = Math.max(1, children.length - visibleCount + 1);
      setTotalPages(pages);
      const parentRect = el.getBoundingClientRect();
      const visibleIndex = children.findIndex((c) => {
        const rect = c.getBoundingClientRect();
        return (
          rect.left >= parentRect.left - 1 && rect.left < parentRect.right - 1
        );
      });
      const idx = visibleIndex === -1 ? 0 : visibleIndex;
      setCurrentIndex(idx);
      setTotalCount(children.length);
      const pageIdx = Math.min(idx, Math.max(0, pages - 1));
      setCurrentPage(pageIdx);
      setAnnouncement(`Showing ${pageIdx + 1} of ${pages}`);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scroll(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scroll(1);
      }
    };

    update();
    el.addEventListener("scroll", update);
    el.addEventListener("keydown", onKey);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      el.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", update);
    };
  }, [containerId, scroll]);
  const goToPage = (page: number) => {
    const el = document.getElementById(containerId) as HTMLElement | null;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;
    const gapStr =
      getComputedStyle(el).gap || getComputedStyle(el).columnGap || "0px";
    const gap = parseFloat(gapStr) || 0;
    const firstRect = children[0].getBoundingClientRect();
    const itemFullWidth = firstRect ? firstRect.width + gap : el.clientWidth;
    const visibleCount = Math.max(
      1,
      Math.floor(el.clientWidth / itemFullWidth),
    );
    const maxStart = Math.max(0, children.length - visibleCount);
    const childIndex = Math.min(page, maxStart);
    const target = children[childIndex];
    if (!target) return;
    const parentRect = el.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const delta = rect.left - parentRect.left;
    const newLeft = Math.round(el.scrollLeft + delta);
    el.scrollTo({ left: newLeft, behavior: "smooth" });
    setCurrentPage(page);
  };

  // autoplay removed — carousel is manual only (chevrons/dots)
  return (
    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
      <div className="absolute left-0 sm:-left-3 top-1/2 -translate-y-1/2 pointer-events-auto z-10">
        <Button
          aria-label={`Previous — ${currentIndex + 1} of ${totalCount}`}
          title={`Previous — ${currentIndex + 1} of ${totalCount}`}
          onClick={() => scroll(-1)}
          disabled={!canLeft}
          className={`rounded-full p-2 sm:p-3 shadow-lg transition-all disabled:opacity-20 disabled:filter disabled:grayscale bg-card text-foreground dark:bg-black/60 dark:text-white hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              d="M15 18l-6-6 6-6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>

      <div className="absolute right-0 sm:-right-3 top-1/2 -translate-y-1/2 pointer-events-auto z-10">
        <Button
          aria-label={`Next — ${currentIndex + 1} of ${totalCount}`}
          title={`Next — ${currentIndex + 1} of ${totalCount}`}
          onClick={() => scroll(1)}
          disabled={!canRight}
          className={`rounded-full p-2 sm:p-3 shadow-lg transition-all disabled:opacity-20 disabled:filter disabled:grayscale bg-card text-foreground dark:bg-black/60 dark:text-white dark:hover:bg-black/80 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              d="M9 6l6 6-6 6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
      {/* SR-only live region for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      {/* autoplay progress bar */}
      {/* no autoplay progress bar */}
      {/* Visible dot indicators for sighted users */}
      {totalPages > 1 && (
        <div className="absolute left-1/2 bottom-2 -translate-x-1/2 pointer-events-auto flex gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              onClick={() => goToPage(i)}
              aria-label={`Show page ${i + 1} of ${totalPages}`}
              title={`Show page ${i + 1} of ${totalPages}`}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-transform focus:outline-none ${
                i === currentPage
                  ? "bg-foreground scale-110"
                  : "bg-muted/70 hover:bg-muted/90"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
