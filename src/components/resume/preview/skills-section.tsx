import { Skill } from "@/types/resume";

interface SkillsSectionProps {
  skills: Skill[];
}

// Helper function to group skills by category
const groupSkillsByCategory = (skills: Skill[]) => {
  const grouped: { [category: string]: Skill[] } = {};
  skills.forEach(skill => {
    if (skill.name) { // Ensure skill has a name
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
  if (!skills.some((skill) => skill.name)) {
    return null;
  }

  const groupedSkills = groupSkillsByCategory(skills);

  return (
    <section>
      <h2 className="text-base font-bold text-primary uppercase mb-2 pb-1 border-b border-border">SKILLS</h2>
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <div key={category} className="mb-4">
          <h3 className="text-sm font-bold uppercase text-primary mb-2">{category}</h3>
          <div className="flex flex-wrap gap-2 pt-2">
            {categorySkills.map(
              (skill) => (
                skill.name && (
                  <span
                    key={skill.id}
                    className="px-2 py-1 rounded-full border text-xs font-medium bg-black text-white border-white dark:bg-white dark:text-black dark:border-black"
                  >
                    {skill.name}
                  </span>
                )
              ),
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
