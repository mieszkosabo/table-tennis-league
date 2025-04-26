import { type ClassValue, clsx } from "clsx";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateJoinCode = customAlphabet(
  "ABCDEFGHIJKLMNOPRQSTUVWXYZ1234567890",
  8,
);

export const uuid = () => crypto.randomUUID();
