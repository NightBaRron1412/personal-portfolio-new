import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { prefersReducedMotion } from "./motion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const scrollToId = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: prefersReducedMotion() ? "instant" : "smooth", block: "start" });
  }
};
