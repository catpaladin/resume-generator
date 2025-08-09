import { render, screen, fireEvent } from "@testing-library/react";
import { EducationForm } from "../education-form";
import { Education } from "@/types/resume";

// Mock the sortable item component since it's not relevant for these tests
jest.mock("@/components/ui/sortable-item", () => ({
  SortableItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("EducationForm", () => {
  const mockEducation: Education[] = [
    {
      id: "1",
      school: "University of California",
      degree: "Bachelor of Science",
      graduationYear: "2020",
    },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render education entries", () => {
    render(<EducationForm education={mockEducation} onChange={mockOnChange} />);

    expect(
      screen.getByDisplayValue("University of California"),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Bachelor of Science")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2020")).toBeInTheDocument();
  });

  it("should call onChange when school field is changed", () => {
    render(<EducationForm education={mockEducation} onChange={mockOnChange} />);

    const schoolInput = screen.getByPlaceholderText(
      "e.g., University of Somewhere",
    );
    fireEvent.change(schoolInput, { target: { value: "Stanford University" } });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        id: "1",
        school: "Stanford University",
        degree: "Bachelor of Science",
        graduationYear: "2020",
      },
    ]);
  });

  it("should call onChange when degree field is changed", () => {
    render(<EducationForm education={mockEducation} onChange={mockOnChange} />);

    const degreeInput = screen.getByPlaceholderText(
      "e.g., B.Sc. Computer Science",
    );
    fireEvent.change(degreeInput, { target: { value: "Master of Science" } });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        id: "1",
        school: "University of California",
        degree: "Master of Science",
        graduationYear: "2020",
      },
    ]);
  });

  it("should call onChange when graduation year field is changed", () => {
    render(<EducationForm education={mockEducation} onChange={mockOnChange} />);

    const yearInput = screen.getByPlaceholderText("e.g., 2024");
    fireEvent.change(yearInput, { target: { value: "2022" } });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        id: "1",
        school: "University of California",
        degree: "Bachelor of Science",
        graduationYear: "2022",
      },
    ]);
  });

  it("should call onChange when adding a new education entry", () => {
    render(<EducationForm education={mockEducation} onChange={mockOnChange} />);

    const addButton = screen.getByText("Add Education");
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalled();
    const newEducation = mockOnChange.mock.calls[0][0];
    expect(newEducation).toHaveLength(2);
    expect(newEducation[1].school).toBe("");
    expect(newEducation[1].degree).toBe("");
    expect(newEducation[1].graduationYear).toBe("");
  });

  it("should call onChange when removing an education entry", () => {
    render(<EducationForm education={mockEducation} onChange={mockOnChange} />);

    const removeButton = screen.getByRole("button", {
      name: /Remove education/i,
    });
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
