import { render, screen } from "@testing-library/react";
import { EducationSection } from "../education-section";
import { Education } from "@/types/resume";

describe("EducationSection", () => {
  const mockEducation: Education[] = [
    {
      id: "1",
      school: "University of California, Berkeley",
      degree: "Bachelor of Science in Computer Science",
      graduationYear: "2020",
    },
    {
      id: "2",
      school: "Stanford University",
      degree: "Master of Science in Software Engineering",
      graduationYear: "2022",
    },
  ];

  it("should render null when no education data is provided", () => {
    const { container } = render(<EducationSection education={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render null when education data is undefined", () => {
    const { container } = render(
      <EducationSection education={undefined as unknown as Education[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render null when education data is undefined", () => {
    const { container } = render(
      <EducationSection education={undefined as unknown as Education[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render education entries with school, degree, and graduation year", () => {
    render(<EducationSection education={mockEducation} />);

    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(
      screen.getByText("University of California, Berkeley"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Bachelor of Science in Computer Science"),
    ).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
    expect(screen.getByText("Stanford University")).toBeInTheDocument();
    expect(
      screen.getByText("Master of Science in Software Engineering"),
    ).toBeInTheDocument();
    expect(screen.getByText("2022")).toBeInTheDocument();
  });

  it("should render education entries without graduation year when not provided", () => {
    const educationWithoutYear: Education[] = [
      {
        id: "1",
        school: "University of California, Berkeley",
        degree: "Bachelor of Science in Computer Science",
        graduationYear: "",
      },
    ];

    render(<EducationSection education={educationWithoutYear} />);

    expect(
      screen.getByText("University of California, Berkeley"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Bachelor of Science in Computer Science"),
    ).toBeInTheDocument();
    expect(screen.queryByText("2020")).not.toBeInTheDocument();
  });

  it("should render education entries without degree when not provided", () => {
    const educationWithoutDegree: Education[] = [
      {
        id: "1",
        school: "University of California, Berkeley",
        degree: "",
        graduationYear: "2020",
      },
    ];

    render(<EducationSection education={educationWithoutDegree} />);

    expect(
      screen.getByText("University of California, Berkeley"),
    ).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
    expect(
      screen.queryByText("Bachelor of Science in Computer Science"),
    ).not.toBeInTheDocument();
  });

  it("should not render entries with empty school and degree", () => {
    const educationWithoutSchoolOrDegree: Education[] = [
      {
        id: "1",
        school: "",
        degree: "",
        graduationYear: "2020",
      },
    ];

    const { container } = render(
      <EducationSection education={educationWithoutSchoolOrDegree} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
