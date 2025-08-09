import { render, screen, fireEvent } from "@testing-library/react";
import { SkillsForm } from "../skills-form";
import { Skill } from "@/types/resume";
import "@testing-library/jest-dom";

// Mock dnd-kit components since they're not relevant for testing the core logic
jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  closestCenter: jest.fn(),
  KeyboardSensor: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
}));

jest.mock("@dnd-kit/sortable", () => ({
  arrayMove: jest.fn((array, from, to) => {
    const newArray = [...array];
    const [movedItem] = newArray.splice(from, 1);
    newArray.splice(to, 0, movedItem);
    return newArray;
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  sortableKeyboardCoordinates: jest.fn(),
  verticalListSortingStrategy: jest.fn(),
}));

jest.mock("@/components/ui/sortable-item", () => ({
  SortableItem: ({ children }: { children: React.ReactNode; id?: string }) => (
    <div>{children}</div>
  ),
}));

// Mock UI components
jest.mock("@/components/ui/card", () => ({
  __esModule: true,
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  __esModule: true,
  TextInput: ({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
  }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid={`input-${label}`}
    />
  ),
}));

jest.mock("@/components/ui/button/button", () => ({
  __esModule: true,
  Button: ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button onClick={onClick} data-testid="add-skill-button">
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/button/icon-button", () => ({
  __esModule: true,
  IconButton: ({
    onClick,
    "aria-label": ariaLabel,
  }: {
    onClick: () => void;
    "aria-label": string;
  }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      data-testid={`icon-button-${ariaLabel}`}
    >
      Remove
    </button>
  ),
}));

describe("SkillsForm", () => {
  const mockSkills: Skill[] = [
    { id: "1", name: "JavaScript", category: "Programming Languages" },
    { id: "2", name: "React", category: "Frameworks" },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render skills correctly", () => {
    render(<SkillsForm skills={mockSkills} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue("JavaScript")).toBeInTheDocument();
    expect(screen.getByDisplayValue("React")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Programming Languages"),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Frameworks")).toBeInTheDocument();
  });

  it("should add a new skill when add button is clicked", () => {
    render(<SkillsForm skills={mockSkills} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId("add-skill-button"));

    expect(mockOnChange).toHaveBeenCalledWith([
      ...mockSkills,
      expect.objectContaining({
        id: expect.any(String),
        name: "",
        category: "",
      }),
    ]);
  });

  it("should remove a skill when remove button is clicked", () => {
    render(<SkillsForm skills={mockSkills} onChange={mockOnChange} />);

    const removeButtons = screen.getAllByTestId("icon-button-Remove skill");
    fireEvent.click(removeButtons[0]);

    // Should remove the first skill
    expect(mockOnChange).toHaveBeenCalledWith([mockSkills[1]]);
  });

  it("should update skill name when input changes", () => {
    render(<SkillsForm skills={mockSkills} onChange={mockOnChange} />);

    const nameInput = screen.getByDisplayValue("JavaScript");
    fireEvent.change(nameInput, { target: { value: "TypeScript" } });

    expect(mockOnChange).toHaveBeenCalledWith([
      { id: "1", name: "TypeScript", category: "Programming Languages" },
      mockSkills[1],
    ]);
  });

  it("should update skill category when input changes", () => {
    render(<SkillsForm skills={mockSkills} onChange={mockOnChange} />);

    const categoryInput = screen.getByDisplayValue("Programming Languages");
    fireEvent.change(categoryInput, { target: { value: "Languages" } });

    expect(mockOnChange).toHaveBeenCalledWith([
      { id: "1", name: "JavaScript", category: "Languages" },
      mockSkills[1],
    ]);
  });
});
