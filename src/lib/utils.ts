import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera un código de cliente único de 6 caracteres
 * Usa caracteres que no se confunden fácilmente (sin 0/O, 1/I/L)
 */
export function generateClientCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Formatea un código de cliente para mostrar (ABC-123)
 */
export function formatClientCode(code: string | undefined | null): string {
  if (!code) return "---";
  if (code.length !== 6) return code;
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}
