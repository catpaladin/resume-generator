import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExperienceForm } from "../experience-form";
import type { Experience } from "@/types/resume";

describe("ExperienceForm", () => {
  const mockExperience: Experience[] = [
    {
      id: "1",
      company: "Tech Corp",
      position: "Software Engineer",
      location: "San Francisco, CA",
      startDate: "2020-01",
      endDate: "2022-12",
      bulletPoints: [
        { id: "1-1", text: "Worked with React and TypeScript" },
        { id: "1-2", text: "Implemented unit tests" },
      ],
    },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render experience entries", () => {
    render(
      <ExperienceForm experiences={mockExperience} onChange={mockOnChange} />,
    );

    expect(screen.getByLabelText("Company")).toHaveValue("Tech Corp");
    expect(screen.getByLabelText("Position")).toHaveValue("Software Engineer");
    expect(screen.getByLabelText("Location")).toHaveValue("San Francisco, CA");
    expect(screen.getByLabelText("Start Date")).toHaveValue("2020-01");
    expect(screen.getByLabelText("End Date")).toHaveValue("2022-12");
  });

  it("should call onChange when company field is modified", () => {
    render(
      <ExperienceForm experiences={mockExperience} onChange={mockOnChange} />,
    );

    const companyInput = screen.getByLabelText("Company");
    fireEvent.change(companyInput, { target: { value: "Innovative Inc" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should call onChange when position field is modified", () => {
    render(
      <ExperienceForm experiences={mockExperience} onChange={mockOnChange} />,
    );

    const positionInput = screen.getByLabelText("Position");
    fireEvent.change(positionInput, { target: { value: "Senior Developer" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should call onChange when location field is modified", () => {
    render(
      <ExperienceForm experiences={mockExperience} onChange={mockOnChange} />,
    );

    const locationInput = screen.getByLabelText("Location");
    fireEvent.change(locationInput, { target: { value: "New York, NY" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should call onChange when start date field is modified", () => {
    render(
      <ExperienceForm experiences={mockExperience} onChange={mockOnChange} />,
    );

    const startDateInput = screen.getByLabelText("Start Date");
    fireEvent.change(startDateInput, { target: { value: "2019-06" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should call onChange when end date field is modified", () => {
    render(
      <ExperienceForm experiences={mockExperience} onChange={mockOnChange} />,
    );

    const endDateInput = screen.getByLabelText("End Date");
    fireEvent.change(endDateInput, { target: { value: "2023-05" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should call onChange when adding a new experience entry", () => {
    render(
      <ExperienceForm experiences={mockExperience} onChange={mockOnChange} />,
    );

    const addButton = screen.getByText("Add Experience");
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should call onChange when removing an experience entry", () => {
    render(
      <ExperienceForm experiences={mockExperience} onChange={mockOnChange} />,
    );

    const removeButton = screen.getByRole("button", {
      name: /Remove experience/i,
    });
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should call onChange when adding a new achievement", () => {
    render(
      <ExperienceForm experiences={mockExperience} onChange={mockOnChange} />,
    );

    const addButton = screen.getByText("Add Achievement");
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should call onChange when removing a bullet point", () => {
    render(
      <ExperienceForm experiences={mockExperience} onChange={mockOnChange} />,
    );

    // Find the remove button for bullet points by its icon
    const removeButtons = screen.getAllByRole("button", {
      name: /Remove bullet point/i,
    });
    fireEvent.click(removeButtons[0]);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should call onChange when modifying a bullet point", () => {
    render(
      <ExperienceForm experiences={mockExperience} onChange={mockOnChange} />,
    );

    const bulletInput = screen.getByDisplayValue(
      "Worked with React and TypeScript",
    );
    fireEvent.change(bulletInput, {
      target: { value: "Led a team of developers" },
    });

    expect(mockOnChange).toHaveBeenCalled();
  });
});
