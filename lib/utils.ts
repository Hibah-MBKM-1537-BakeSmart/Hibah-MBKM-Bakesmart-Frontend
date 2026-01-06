import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function getImageUrl(path: string | undefined | null): string {
  if (!path) return "/placeholder.svg";
  if (
    path.startsWith("http") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  )
    return path;
  return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
