import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ResumeData } from "@/types/resume";
import { docxExporter } from "@/lib/exporters/docx-exporter";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a phone number with dashes and support international numbers
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // If empty, return empty
  if (!cleaned) return "";

  // Handle standard US 10-digit number
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Handle international or longer numbers
  if (cleaned.length > 10) {
    // Format as +X-XXX-XXX-XXXX or similar based on length
    // For simplicity, we'll just add dashes every few digits
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    // Generic grouping for very long numbers
    return cleaned.replace(/(\d{3})(?=\d)/g, "$1-");
  }

  // Short numbers (e.g. while typing)
  if (cleaned.length > 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length > 3) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }

  return cleaned;
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
 * Export resume as DOCX file
 */
export async function exportResumeToDocx(
  data: ResumeData,
  options: {
    fileName?: string;
    includeProjects?: boolean;
    includeSummary?: boolean;
  } = {},
): Promise<void> {
  await docxExporter.exportToFile(data, {
    fileName:
      options.fileName ||
      `resume-${new Date().toISOString().split("T")[0]}.docx`,
    includeProjects: options.includeProjects ?? true,
    includeSummary: options.includeSummary ?? true,
  });
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
      } catch {
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
 * Debounce function with proper typing
 */
export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  wait: number,
): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<F>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
