import { Skill } from "@/types/resume";
import { useState, useEffect } from "react";
import { groupSkillsByCategory } from "@/lib/skills-utils";

interface SkillsSectionProps {
  skills: Skill[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state only on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ensure skills exist and have at least one named skill
  if (!skills || !skills.some((skill) => skill.name)) {
    return null;
  }

  // Calculate groupedSkills only when mounted
  const groupedSkills = isMounted ? groupSkillsByCategory(skills) : {};

  // If not mounted or no skills grouped, render nothing for this section
  if (!isMounted || Object.keys(groupedSkills).length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-2 border-b border-border pb-1 text-base font-bold uppercase text-primary">
        SKILLS
      </h2>
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <div key={category} className="mb-4">
          <h3 className="mb-2 text-sm font-bold uppercase text-primary">
            {category}
          </h3>
          <div className="flex flex-wrap gap-2 pt-2">
            {categorySkills.map((skill: Skill) => {
              if (!skill.name) {
                return null;
              }
              return (
                <span
                  key={skill.id}
                  className="rounded-full border border-white bg-black px-2 py-1 text-xs font-medium text-white dark:border-black dark:bg-white dark:text-black"
                >
                  {skill.name}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
