/**
 * Utility helpers
 * Small pure helpers (formatters, parsers) used by server and client code.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
