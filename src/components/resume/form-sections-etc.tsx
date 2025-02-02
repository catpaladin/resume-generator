"use client";

import React from 'react';
import type { Education, Project } from './types';

export const EducationSection = ({
  education,
  onChange,
  onAdd
}: {
  education: Education[],
  onChange: (education: Education[]) => void,
  onAdd: () => void
}) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold mb-2">Education</h3>
    {education.map((edu, index) => (
      <div key={index} className="grid gap-3 mb-3">
        <input
          type="text"
          placeholder="School"
          value={edu.school}
          onChange={(e) => {
            const newEducation = [...education];
            newEducation[index].school = e.target.value;
            onChange(newEducation);
          }}
          className="border-input border p-2 rounded"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Degree"
            value={edu.degree}
            onChange={(e) => {
              const newEducation = [...education];
              newEducation[index].degree = e.target.value;
              onChange(newEducation);
            }}
            className="border-input border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Graduation Year"
            value={edu.graduationYear}
            onChange={(e) => {
              const newEducation = [...education];
              newEducation[index].graduationYear = e.target.value;
              onChange(newEducation);
            }}
            className="border-input border p-2 rounded"
          />
        </div>
      </div>
    ))}
    <button
      onClick={onAdd}
      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
    >
      Add Education
    </button>
  </div>
);

export const ProjectsSection = ({
  projects,
  onChange,
  onAdd
}: {
  projects: Project[],
  onChange: (projects: Project[]) => void,
  onAdd: () => void
}) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold mb-2">Projects</h3>
    {projects.map((project, index) => (
      <div key={index} className="grid gap-3 mb-3">
        <input
          type="text"
          placeholder="Project Name"
          value={project.name}
          onChange={(e) => {
            const newProjects = [...projects];
            newProjects[index].name = e.target.value;
            onChange(newProjects);
          }}
          className="border-input border p-2 rounded"
        />
        <input
          type="url"
          placeholder="Project Link"
          value={project.link}
          onChange={(e) => {
            const newProjects = [...projects];
            newProjects[index].link = e.target.value;
            onChange(newProjects);
          }}
          className="border-input border p-2 rounded"
        />
        <textarea
          placeholder="Short Description"
          value={project.description}
          onChange={(e) => {
            const newProjects = [...projects];
            newProjects[index].description = e.target.value;
            onChange(newProjects);
          }}
          className="border-input border p-2 rounded h-16"
        />
      </div>
    ))}
    <button
      onClick={onAdd}
      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
    >
      Add Project
    </button>
  </div>
);
