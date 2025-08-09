import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectsForm } from "../projects-form";
import { Project } from "@/types/resume";

// Mock the sortable item component since it's not relevant for these tests
jest.mock("@/components/ui/sortable-item", () => ({
  SortableItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("ProjectsForm", () => {
  const mockProjects: Project[] = [
    {
      id: "1",
      name: "Resume Generator App",
      link: "https://github.com/user/resume-generator",
      description: "A TypeScript application for creating resumes",
    },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render project entries", () => {
    render(<ProjectsForm projects={mockProjects} onChange={mockOnChange} />);

    expect(
      screen.getByDisplayValue("Resume Generator App"),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("https://github.com/user/resume-generator"),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("A TypeScript application for creating resumes"),
    ).toBeInTheDocument();
  });

  it("should call onChange when project name field is changed", () => {
    render(<ProjectsForm projects={mockProjects} onChange={mockOnChange} />);

    const nameInput = screen.getByPlaceholderText("e.g., Resume Builder");
    fireEvent.change(nameInput, { target: { value: "Portfolio Website" } });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        id: "1",
        name: "Portfolio Website",
        link: "https://github.com/user/resume-generator",
        description: "A TypeScript application for creating resumes",
      },
    ]);
  });

  it("should call onChange when project link field is changed", () => {
    render(<ProjectsForm projects={mockProjects} onChange={mockOnChange} />);

    const linkInput = screen.getByPlaceholderText("https://example.com");
    fireEvent.change(linkInput, { target: { value: "https://new-url.com" } });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        id: "1",
        name: "Resume Generator App",
        link: "https://new-url.com",
        description: "A TypeScript application for creating resumes",
      },
    ]);
  });

  it("should call onChange when project description field is changed", () => {
    render(<ProjectsForm projects={mockProjects} onChange={mockOnChange} />);

    const descriptionInput = screen.getByPlaceholderText(
      "What it does, your role, and impact",
    );
    fireEvent.change(descriptionInput, {
      target: { value: "An updated description" },
    });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        id: "1",
        name: "Resume Generator App",
        link: "https://github.com/user/resume-generator",
        description: "An updated description",
      },
    ]);
  });

  it("should call onChange when adding a new project entry", () => {
    render(<ProjectsForm projects={mockProjects} onChange={mockOnChange} />);

    const addButton = screen.getByText("Add Project");
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalled();
    const newProjects = mockOnChange.mock.calls[0][0];
    expect(newProjects).toHaveLength(2);
    expect(newProjects[1].name).toBe("");
    expect(newProjects[1].link).toBe("");
    expect(newProjects[1].description).toBe("");
  });

  it("should call onChange when removing a project entry", () => {
    render(<ProjectsForm projects={mockProjects} onChange={mockOnChange} />);

    const removeButton = screen.getByRole("button", {
      name: /Remove project/i,
    });
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
