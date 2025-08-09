import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PersonalInfoForm } from "../personal-info-form";
import type { PersonalInfo } from "@/types/resume";

describe("PersonalInfoForm", () => {
  const mockData: PersonalInfo = {
    fullName: "John Doe",
    location: "San Francisco, CA",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    linkedin: "https://linkedin.com/in/johndoe",
    summary: "Experienced software developer",
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render all form fields with correct values", () => {
    render(<PersonalInfoForm data={mockData} onChange={mockOnChange} />);

    expect(screen.getByLabelText("Full Name")).toHaveValue("John Doe");
    expect(screen.getByLabelText("Location")).toHaveValue("San Francisco, CA");
    expect(screen.getByLabelText("Email")).toHaveValue("john@example.com");
    expect(screen.getByLabelText("Phone")).toHaveValue("+1 (555) 123-4567");
    expect(screen.getByLabelText("LinkedIn URL")).toHaveValue(
      "https://linkedin.com/in/johndoe",
    );
    expect(screen.getByLabelText("Professional Summary")).toHaveValue(
      "Experienced software developer",
    );
  });

  it("should call onChange when name field is modified", () => {
    render(<PersonalInfoForm data={mockData} onChange={mockOnChange} />);

    const nameInput = screen.getByLabelText("Full Name");
    fireEvent.change(nameInput, { target: { value: "Jane Smith" } });

    expect(mockOnChange).toHaveBeenCalledWith("fullName", "Jane Smith");
  });

  it("should call onChange when location field is modified", () => {
    render(<PersonalInfoForm data={mockData} onChange={mockOnChange} />);

    const locationInput = screen.getByLabelText("Location");
    fireEvent.change(locationInput, { target: { value: "New York, NY" } });

    expect(mockOnChange).toHaveBeenCalledWith("location", "New York, NY");
  });

  it("should call onChange when email field is modified", () => {
    render(<PersonalInfoForm data={mockData} onChange={mockOnChange} />);

    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "jane@example.com" } });

    expect(mockOnChange).toHaveBeenCalledWith("email", "jane@example.com");
  });

  it("should call onChange when phone field is modified", () => {
    render(<PersonalInfoForm data={mockData} onChange={mockOnChange} />);

    const phoneInput = screen.getByLabelText("Phone");
    fireEvent.change(phoneInput, { target: { value: "+1 (555) 987-6543" } });

    expect(mockOnChange).toHaveBeenCalledWith("phone", "+1 (555) 987-6543");
  });

  it("should call onChange when linkedin field is modified", () => {
    render(<PersonalInfoForm data={mockData} onChange={mockOnChange} />);

    const linkedinInput = screen.getByLabelText("LinkedIn URL");
    fireEvent.change(linkedinInput, {
      target: { value: "https://linkedin.com/in/janesmith" },
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      "linkedin",
      "https://linkedin.com/in/janesmith",
    );
  });

  it("should call onChange when summary field is modified", () => {
    render(<PersonalInfoForm data={mockData} onChange={mockOnChange} />);

    const summaryInput = screen.getByLabelText("Professional Summary");
    fireEvent.change(summaryInput, {
      target: { value: "Senior software developer with 5 years experience" },
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      "summary",
      "Senior software developer with 5 years experience",
    );
  });

  it("should render null when data is undefined", () => {
    const { container } = render(
      <PersonalInfoForm data={undefined} onChange={mockOnChange} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
