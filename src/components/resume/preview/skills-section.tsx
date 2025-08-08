import { Skill } from "@/types/resume";
import { useState, useEffect } from "react";

interface SkillsSectionProps {
  skills: Skill[];
}

// Helper function to group skills by category
const groupSkillsByCategory = (skills: Skill[]) => {
  const grouped: { [category: string]: Skill[] } = {};
  skills.forEach((skill) => {
    if (skill.name) {
      // Ensure skill has a name
      const category = skill.category || "General Skills";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    }
  });
  return grouped;
};

export function SkillsSection({ skills }: SkillsSectionProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state only on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Log the skills prop on initial render and subsequent updates
  console.log("SkillsSection received skills:", skills);

  // Ensure skills exist and have at least one named skill
  if (!skills || !skills.some((skill) => skill.name)) {
    return null;
  }

  // Calculate groupedSkills only when mounted, with error handling
  let groupedSkills: { [category: string]: Skill[] } = {};
  if (isMounted) {
    try {
      groupedSkills = groupSkillsByCategory(skills);
    } catch (error) {
      console.error("Error grouping skills:", error, "\nSkills data:", skills);
      return (
        <section>
          <p className="text-red-500">Error displaying skills.</p>
        </section>
      ); // Render error message
    }
  }

  // If not mounted or no skills grouped, render nothing for this section
  if (!isMounted || Object.keys(groupedSkills).length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-2 border-b border-border pb-1 text-base font-bold uppercase text-primary">
        SKILLS
      </h2>
      {/* We know isMounted is true and groupedSkills has keys here */}
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <div key={category} className="mb-4">
          <h3 className="mb-2 text-sm font-bold uppercase text-primary">
            {category}
          </h3>
          <div className="flex flex-wrap gap-2 pt-2">
            {categorySkills.map((skill) => {
              // Add check for valid skill object and name
              if (!skill || !skill.name) {
                console.warn("Skipping invalid skill object:", skill);
                return null;
              }
              return (
                <span
                  key={skill.id} // Ensure skill.id is always valid or provide fallback
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
