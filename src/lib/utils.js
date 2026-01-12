import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function toCapitalize(str, eachWord = false) {
  if (!str) return "";
  if (eachWord) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
