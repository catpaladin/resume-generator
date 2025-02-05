import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ResumeData } from "@/types/resume";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a phone number to (XXX) XXX-XXXX format
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Extract domain from URL
 */
export function getDomainFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

/**
 * Export resume data as JSON file
 */
export function exportResumeData(data: ResumeData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `resume-data-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import resume data from JSON file
 */
export async function importResumeData(file: File): Promise<ResumeData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (isValidResumeData(data)) {
          resolve(data as ResumeData);
        } else {
          reject(new Error("Invalid resume data format"));
        }
      } catch (error) {
        reject(new Error("Failed to parse resume data"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Check if value is defined and not empty
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if string is empty or only whitespace
 */
export function isEmptyString(str: string): boolean {
  return str.trim().length === 0;
}

/**
 * Validate resume data structure
 */
function isValidResumeData(data: unknown): data is ResumeData {
  if (!data || typeof data !== "object") return false;

  const requiredKeys: (keyof ResumeData)[] = [
    "personal",
    "skills",
    "experience",
    "education",
    "projects",
  ];

  return requiredKeys.every((key) => key in data);
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
