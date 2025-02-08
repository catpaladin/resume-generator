export type TabType =
  | "personal"
  | "skills"
  | "experience"
  | "education"
  | "projects";

export interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}
