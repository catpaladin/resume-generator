import type { Skill } from "@/types/resume";

/**
 * Groups skills by category for display in the resume preview.
 * Skills without a category are grouped under "General Skills".
 *
 * @param skills - Array of skills to group
 * @returns Object with categories as keys and arrays of skills as values
 */
export const groupSkillsByCategory = (
  skills: Skill[],
): Record<string, Skill[]> => {
  const grouped: Record<string, Skill[]> = {};

  skills.forEach((skill) => {
    if (skill.name) {
      const category = skill.category || "General Skills";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    }
  });

  return grouped;
};

/**
 * Validates a skill object to ensure it has the required properties.
 *
 * @param skill - Skill object to validate
 * @returns True if the skill is valid, false otherwise
 */
export const isValidSkill = (skill: Skill): boolean => {
  return (
    skill.id !== undefined &&
    skill.name !== undefined &&
    skill.name.trim() !== ""
  );
};
