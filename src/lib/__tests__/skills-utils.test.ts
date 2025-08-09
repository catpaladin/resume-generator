import { groupSkillsByCategory, isValidSkill } from "../skills-utils";
import { Skill } from "@/types/resume";

describe("Skills Utilities", () => {
  describe("groupSkillsByCategory", () => {
    it("should group skills by their categories", () => {
      const skills: Skill[] = [
        { id: "1", name: "JavaScript", category: "Programming Languages" },
        { id: "2", name: "TypeScript", category: "Programming Languages" },
        { id: "3", name: "React", category: "Frameworks" },
        { id: "4", name: "Node.js", category: "Frameworks" },
      ];

      const grouped = groupSkillsByCategory(skills);

      expect(grouped["Programming Languages"]).toHaveLength(2);
      expect(grouped["Frameworks"]).toHaveLength(2);
      expect(grouped["Programming Languages"]).toEqual([
        { id: "1", name: "JavaScript", category: "Programming Languages" },
        { id: "2", name: "TypeScript", category: "Programming Languages" },
      ]);
      expect(grouped["Frameworks"]).toEqual([
        { id: "3", name: "React", category: "Frameworks" },
        { id: "4", name: "Node.js", category: "Frameworks" },
      ]);
    });

    it('should group skills without categories under "General Skills"', () => {
      const skills: Skill[] = [
        { id: "1", name: "Communication", category: "Soft Skills" },
        { id: "2", name: "Problem Solving" }, // No category
        { id: "3", name: "Leadership", category: "" }, // Empty category
      ];

      const grouped = groupSkillsByCategory(skills);

      expect(grouped["Soft Skills"]).toHaveLength(1);
      expect(grouped["General Skills"]).toHaveLength(2);
      expect(grouped["General Skills"]).toEqual([
        { id: "2", name: "Problem Solving" },
        { id: "3", name: "Leadership", category: "" },
      ]);
    });

    it("should handle empty skills array", () => {
      const skills: Skill[] = [];
      const grouped = groupSkillsByCategory(skills);

      expect(grouped).toEqual({});
    });

    it("should filter out skills without names", () => {
      const skills: Skill[] = [
        { id: "1", name: "JavaScript", category: "Programming Languages" },
        { id: "2", name: "", category: "Frameworks" }, // Empty name
        { id: "3", name: "React" }, // Valid skill
      ];

      const grouped = groupSkillsByCategory(skills);

      expect(grouped["Programming Languages"]).toHaveLength(1);
      expect(grouped["Frameworks"]).toBeUndefined();
      expect(grouped["General Skills"]).toHaveLength(1);
    });
  });

  describe("isValidSkill", () => {
    it("should return true for valid skills", () => {
      const skill: Skill = { id: "1", name: "JavaScript" };
      expect(isValidSkill(skill)).toBe(true);
    });

    it("should return false for skills without names", () => {
      const skill: Skill = { id: "1", name: "" };
      expect(isValidSkill(skill)).toBe(false);
    });

    it("should return false for skills with only whitespace names", () => {
      const skill: Skill = { id: "1", name: "   " };
      expect(isValidSkill(skill)).toBe(false);
    });

    it("should return true for skills with categories", () => {
      const skill: Skill = {
        id: "1",
        name: "JavaScript",
        category: "Programming Languages",
      };
      expect(isValidSkill(skill)).toBe(true);
    });
  });
});
