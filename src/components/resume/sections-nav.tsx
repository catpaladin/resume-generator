"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import {
  List,
  User,
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Folder,
} from "lucide-react";

interface SectionItem {
  id: string;
  label: string;
  icon: ReactNode;
}

const sections: SectionItem[] = [
  { id: "section-header", label: "Header", icon: <User size={14} /> },
  { id: "section-summary", label: "Summary", icon: <List size={14} /> },
  { id: "section-skills", label: "Skills", icon: <BadgeCheck size={14} /> },
  {
    id: "section-experience",
    label: "Experience",
    icon: <Briefcase size={14} />,
  },
  {
    id: "section-education",
    label: "Education",
    icon: <GraduationCap size={14} />,
  },
  { id: "section-projects", label: "Projects", icon: <Folder size={14} /> },
];

export function SectionsNav() {
  const handleJump = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Card className="mb-4 hidden md:block">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Sections</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {sections.map((s) => (
          <Button
            key={s.id}
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => handleJump(s.id)}
            aria-label={`Jump to ${s.label}`}
          >
            <span className="mr-2 inline-flex items-center">{s.icon}</span>
            {s.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
