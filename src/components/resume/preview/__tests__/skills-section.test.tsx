import { render, screen } from "@testing-library/react";
import { SkillsSection } from "../skills-section";
import { Skill } from "@/types/resume";
import "@testing-library/jest-dom";

describe("SkillsSection", () => {
  const mockSkills: Skill[] = [
    { id: "1", name: "JavaScript", category: "Programming Languages" },
    { id: "2", name: "TypeScript", category: "Programming Languages" },
    { id: "3", name: "React", category: "Frameworks" },
    { id: "4", name: "Node.js", category: "Frameworks" },
    { id: "5", name: "Communication" }, // No category
  ];

  it("should render skills grouped by category", () => {
    render(<SkillsSection skills={mockSkills} />);

    // Check that categories are rendered
    expect(screen.getByText("Programming Languages")).toBeInTheDocument();
    expect(screen.getByText("Frameworks")).toBeInTheDocument();
    expect(screen.getByText("General Skills")).toBeInTheDocument();

    // Check that skills are rendered in their respective categories
    const programmingSkills = screen.getAllByText(/JavaScript|TypeScript/);
    expect(programmingSkills).toHaveLength(2);

    const frameworkSkills = screen.getAllByText(/React|Node.js/);
    expect(frameworkSkills).toHaveLength(2);

    const generalSkills = screen.getByText("Communication");
    expect(generalSkills).toBeInTheDocument();
  });

  it("should not render section when no skills have names", () => {
    const skillsWithoutNames: Skill[] = [
      { id: "1", name: "", category: "Programming Languages" },
      { id: "2", name: "", category: "Frameworks" },
    ];

    const { container } = render(<SkillsSection skills={skillsWithoutNames} />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render section when skills array is empty", () => {
    const { container } = render(<SkillsSection skills={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should apply correct styling to skill pills", () => {
    render(<SkillsSection skills={mockSkills} />);

    const skillPills = screen.getAllByText(
      /JavaScript|TypeScript|React|Node.js|Communication/,
    );

    // Check that skill pills have the correct classes
    skillPills.forEach((pill) => {
      expect(pill).toHaveClass("rounded-full");
      expect(pill).toHaveClass("border");
      expect(pill).toHaveClass("px-2");
      expect(pill).toHaveClass("py-1");
      expect(pill).toHaveClass("text-xs");
      expect(pill).toHaveClass("font-medium");
    });
  });
});
