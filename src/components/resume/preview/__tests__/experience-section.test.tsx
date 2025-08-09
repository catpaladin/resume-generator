import { render, screen } from "@testing-library/react";
import { ExperienceSection } from "../experience-section";
import { Experience } from "@/types/resume";

describe("ExperienceSection", () => {
  const mockExperiences: Experience[] = [
    {
      id: "1",
      company: "Tech Corp",
      position: "Software Engineer",
      location: "San Francisco, CA",
      startDate: "2020-01-01",
      endDate: "2022-12-31",
      bulletPoints: [
        {
          id: "1",
          text: "Developed web applications using React and TypeScript",
        },
        { id: "2", text: "Collaborated with cross-functional teams" },
      ],
    },
    {
      id: "2",
      company: "Startup Inc",
      position: "Senior Developer",
      location: "New York, NY",
      startDate: "2023-01-01",
      endDate: "Present",
      bulletPoints: [
        { id: "1", text: "Led frontend development initiatives" },
        { id: "2", text: "Mentored junior developers" },
      ],
    },
  ];

  it("should render null when no experiences are provided", () => {
    const { container } = render(<ExperienceSection experiences={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render null when experiences array is undefined", () => {
    const { container } = render(
      <ExperienceSection experiences={undefined as unknown as Experience[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render experience entries with company, position, location, dates, and bullet points", () => {
    render(<ExperienceSection experiences={mockExperiences} />);

    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    // Location is rendered with a bullet point, so we need to check for the full text
    expect(screen.getByText("• San Francisco, CA")).toBeInTheDocument();
    expect(screen.getByText("2020-01-01 - 2022-12-31")).toBeInTheDocument();
    expect(
      screen.getByText("Developed web applications using React and TypeScript"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Collaborated with cross-functional teams"),
    ).toBeInTheDocument();

    expect(screen.getByText("Startup Inc")).toBeInTheDocument();
    expect(screen.getByText("Senior Developer")).toBeInTheDocument();
    expect(screen.getByText("• New York, NY")).toBeInTheDocument();
    expect(screen.getByText("2023-01-01 - Present")).toBeInTheDocument();
    expect(
      screen.getByText("Led frontend development initiatives"),
    ).toBeInTheDocument();
    expect(screen.getByText("Mentored junior developers")).toBeInTheDocument();
  });

  it("should not render entries with empty company and position", () => {
    const experiencesWithEmptyCompanyAndPosition: Experience[] = [
      {
        id: "1",
        company: "",
        position: "",
        location: "San Francisco, CA",
        startDate: "2020-01-01",
        endDate: "2022-12-31",
        bulletPoints: [{ id: "1", text: "Developed web applications" }],
      },
    ];

    const { container } = render(
      <ExperienceSection
        experiences={experiencesWithEmptyCompanyAndPosition}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render entries without location", () => {
    const experiencesWithoutLocation: Experience[] = [
      {
        id: "1",
        company: "Tech Corp",
        position: "Software Engineer",
        location: "",
        startDate: "2020-01-01",
        endDate: "2022-12-31",
        bulletPoints: [{ id: "1", text: "Developed web applications" }],
      },
    ];

    render(<ExperienceSection experiences={experiencesWithoutLocation} />);
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.queryByText("San Francisco, CA")).not.toBeInTheDocument();
  });

  it("should render entries without dates", () => {
    const experiencesWithoutDates: Experience[] = [
      {
        id: "1",
        company: "Tech Corp",
        position: "Software Engineer",
        location: "San Francisco, CA",
        startDate: "",
        endDate: "",
        bulletPoints: [{ id: "1", text: "Developed web applications" }],
      },
    ];

    render(<ExperienceSection experiences={experiencesWithoutDates} />);
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(
      screen.queryByText("2020-01-01 - 2022-12-31"),
    ).not.toBeInTheDocument();
  });

  it("should render entries without bullet points", () => {
    const experiencesWithoutBulletPoints: Experience[] = [
      {
        id: "1",
        company: "Tech Corp",
        position: "Software Engineer",
        location: "San Francisco, CA",
        startDate: "2020-01-01",
        endDate: "2022-12-31",
        bulletPoints: [],
      },
    ];

    render(<ExperienceSection experiences={experiencesWithoutBulletPoints} />);
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
