import { Skill } from "@/types/resume";

interface SkillsSectionProps {
  skills: Skill[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  if (!skills.some((skill) => skill.name)) {
    return null;
  }

  return (
    <section>
      <h2 className="text-base font-bold mb-2 text-foreground">Skills</h2>
      <div className="flex flex-wrap gap-2">
        {skills.map(
          (skill) =>
            skill.name && (
              <span
                key={skill.id}
                className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
              >
                {skill.name}
              </span>
            ),
        )}
      </div>
    </section>
  );
}
