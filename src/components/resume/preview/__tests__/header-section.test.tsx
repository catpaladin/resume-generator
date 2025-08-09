import { render, screen } from "@testing-library/react";
import { HeaderSection } from "../header-section";
import { PersonalInfo } from "@/types/resume";

describe("HeaderSection", () => {
  const mockPersonalInfo: PersonalInfo = {
    fullName: "John Doe",
    location: "San Francisco, CA",
    email: "john.doe@example.com",
    phone: "(123) 456-7890",
    linkedin: "linkedin.com/in/johndoe",
    summary:
      "Experienced software developer with expertise in TypeScript and React",
  };

  it("should render null when no data is provided", () => {
    const { container } = render(
      <HeaderSection data={undefined as unknown as PersonalInfo} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render the full name", () => {
    render(<HeaderSection data={mockPersonalInfo} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should render all contact information joined by bullet points", () => {
    render(<HeaderSection data={mockPersonalInfo} />);
    expect(
      screen.getByText(
        "San Francisco, CA • john.doe@example.com • (123) 456-7890 • linkedin.com/in/johndoe",
      ),
    ).toBeInTheDocument();
  });

  it("should render the professional summary when provided", () => {
    render(<HeaderSection data={mockPersonalInfo} />);

    expect(screen.getByText("Professional Summary")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Experienced software developer with expertise in TypeScript and React",
      ),
    ).toBeInTheDocument();
  });

  it("should not render summary section when summary is empty", () => {
    const personalInfoWithoutSummary = { ...mockPersonalInfo, summary: "" };
    render(<HeaderSection data={personalInfoWithoutSummary} />);

    expect(screen.queryByText("Professional Summary")).not.toBeInTheDocument();
  });

  it("should render only non-empty contact information", () => {
    const personalInfoWithSomeEmptyFields: PersonalInfo = {
      fullName: "Jane Smith",
      location: "New York, NY",
      email: "",
      phone: "",
      linkedin: "linkedin.com/in/janesmith",
      summary: "Frontend developer specializing in React applications",
    };

    render(<HeaderSection data={personalInfoWithSomeEmptyFields} />);
    expect(
      screen.getByText("New York, NY • linkedin.com/in/janesmith"),
    ).toBeInTheDocument();
  });
});
