import { render, screen } from "@testing-library/react";
import { ProjectsSection } from "../projects-section";
import { Project } from "@/types/resume";

describe("ProjectsSection", () => {
  const mockProjects: Project[] = [
    {
      id: "1",
      name: "Resume Builder App",
      link: "https://github.com/user/resume-builder",
      description: "A web application for creating professional resumes",
    },
    {
      id: "2",
      name: "E-commerce Platform",
      link: "https://ecommerce.example.com",
      description: "Full-stack e-commerce solution with React and Node.js",
    },
    {
      id: "3",
      name: "Mobile Game",
      link: "invalid-url",
      description: "A fun mobile game built with Unity",
    },
  ];

  it("should render null when no projects are provided", () => {
    const { container } = render(<ProjectsSection projects={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render null when projects array is undefined", () => {
    const { container } = render(
      <ProjectsSection projects={undefined as unknown as Project[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render project entries with name, link, and description", () => {
    render(<ProjectsSection projects={mockProjects} />);

    expect(screen.getByText("Resume Builder App")).toBeInTheDocument();
    expect(
      screen.getByText("https://github.com/user/resume-builder"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A web application for creating professional resumes"),
    ).toBeInTheDocument();

    expect(screen.getByText("E-commerce Platform")).toBeInTheDocument();
    expect(
      screen.getByText("https://ecommerce.example.com"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Full-stack e-commerce solution with React and Node.js"),
    ).toBeInTheDocument();
  });

  it("should not render entries with empty name and description", () => {
    const projectsWithEmptyNameAndDescription: Project[] = [
      {
        id: "1",
        name: "",
        link: "https://github.com/user/project",
        description: "",
      },
    ];

    const { container } = render(
      <ProjectsSection projects={projectsWithEmptyNameAndDescription} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should not render entries with empty name and description", () => {
    const projectsWithEmptyNameAndDescription: Project[] = [
      {
        id: "1",
        name: "",
        link: "https://github.com/user/project",
        description: "",
      },
    ];

    const { container } = render(
      <ProjectsSection projects={projectsWithEmptyNameAndDescription} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render entries with empty link", () => {
    const projectsWithEmptyLink: Project[] = [
      {
        id: "1",
        name: "Project Without Link",
        link: "",
        description: "A project without a link",
      },
    ];

    render(<ProjectsSection projects={projectsWithEmptyLink} />);
    expect(screen.getByText("Project Without Link")).toBeInTheDocument();
    // Empty link should not be rendered as a link element
    expect(screen.queryByRole("link", { name: "" })).not.toBeInTheDocument();
  });

  it("should render entries with empty description", () => {
    const projectsWithEmptyDescription: Project[] = [
      {
        id: "1",
        name: "Project Without Description",
        link: "https://github.com/user/project",
        description: "",
      },
    ];

    render(<ProjectsSection projects={projectsWithEmptyDescription} />);
    expect(screen.getByText("Project Without Description")).toBeInTheDocument();
    expect(
      screen.queryByText("A project without a description"),
    ).not.toBeInTheDocument();
  });

  it("should not render invalid URLs as links", () => {
    render(<ProjectsSection projects={mockProjects} />);

    // The third project has an invalid URL, so it should not be rendered as a link
    expect(screen.getByText("Mobile Game")).toBeInTheDocument();
    // Invalid URL should not be rendered
    expect(screen.queryByText("invalid-url")).not.toBeInTheDocument();
    // But it should not be a link element
    expect(
      screen.queryByRole("link", { name: "invalid-url" }),
    ).not.toBeInTheDocument();
  });
});
