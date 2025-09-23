"use client";

/**
 * DetailsMenu
 * Client dropdown menu for actions like edit/delete; closes on pointer leave/selection.
 */

import React, { useRef, PropsWithChildren } from "react";

export default function DetailsMenu({
  summary,
  children,
  className = "",
}: PropsWithChildren<{
  summary: React.ReactElement;
  className?: string;
}>) {
  const ref = useRef<HTMLDetailsElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const close = () => {
    if (ref.current) ref.current.open = false;
  };

  const scheduleClose = (ms = 2000) => {
    clearScheduled();
    // window.setTimeout returns number in browsers
    timerRef.current = window.setTimeout(() => {
      close();
      timerRef.current = null;
    }, ms) as unknown as number;
  };

  const clearScheduled = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const onPointerLeave = () => {
    // Delay closing so users have time to move into the menu
    scheduleClose(2000);
  };

  const onPointerEnter = () => {
    // Cancel scheduled close when pointer returns
    clearScheduled();
  };

  const onClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    // if a link or button inside the menu was clicked, close the details immediately
    if (target.closest("a") || target.closest("button")) {
      clearScheduled();
      close();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      clearScheduled();
      close();
    }
  };

  return (
    <details
      ref={ref}
      className={className}
      onPointerLeave={onPointerLeave}
      onPointerEnter={onPointerEnter}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {summary}
      {children}
    </details>
  );
}
