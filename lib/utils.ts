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

  // Defensive fix: some backends mistakenly return image paths under `/products/<filename>`.
  // That collides with the REST route `/products/{id}` and causes DB errors.
  // If it looks like an image file, rewrite to `/uploads/products/<filename>`.
  const [rawPath, rawQuery] = path.split("?");
  const query = rawQuery ? `?${rawQuery}` : "";
  const imageExtRe = /\.(png|jpe?g|webp|gif|svg)$/i;

  let fixedPath = rawPath;

  if (imageExtRe.test(rawPath) && !rawPath.includes("/uploads/")) {
    const match = rawPath.match(/^\/?products\/(.+)$/i);
    if (match?.[1]) {
      fixedPath = `/uploads/products/${match[1]}`;
    }
  }

  const normalizedPath = fixedPath.startsWith("/") ? fixedPath : `/${fixedPath}`;
  return `${BACKEND_URL}${normalizedPath}${query}`;
}
