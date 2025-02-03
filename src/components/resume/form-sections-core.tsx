"use client";

import React from 'react';
import type { ResumeData, Experience, Education, Project } from './types';

export const PersonalInfoSection = ({
  data,
  onChange
}: {
  data: Pick<ResumeData, 'fullName' | 'location' | 'email' | 'phone' | 'linkedin' | 'summary'>,
  onChange: (field: keyof ResumeData, value: string) => void
}) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
    <div className="grid gap-3">
      <input
        type="text"
        placeholder="Full Name"
        value={data.fullName}
        onChange={(e) => onChange('fullName', e.target.value)}
        className="border-input border p-2 rounded"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Location"
          value={data.location}
          onChange={(e) => onChange('location', e.target.value)}
          className="border-input border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="border-input border p-2 rounded"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="tel"
          placeholder="Phone"
          value={data.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="border-input border p-2 rounded"
        />
        <input
          type="text"
          placeholder="LinkedIn URL"
          value={data.linkedin}
          onChange={(e) => onChange('linkedin', e.target.value)}
          className="border-input border p-2 rounded"
        />
      </div>
      <textarea
        placeholder="Professional Summary"
        value={data.summary}
        onChange={(e) => onChange('summary', e.target.value)}
        className="border-input border p-2 rounded h-20"
      />
    </div>
  </div>
);

export const SkillsSection = ({
  skills,
  onChange,
  onAdd
}: {
  skills: string[],
  onChange: (skills: string[]) => void,
  onAdd: () => void
}) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold mb-2">Skills</h3>
    {skills.map((skill, index) => (
      <input
        key={index}
        type="text"
        placeholder="Skill"
        value={skill}
        onChange={(e) => {
          const newSkills = [...skills];
          newSkills[index] = e.target.value;
          onChange(newSkills);
        }}
        className="border-input border p-2 rounded mb-2 w-full"
      />
    ))}
    <button
      onClick={onAdd}
      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
    >
      Add Skill
    </button>
  </div>
);

export const ExperienceSection = ({
  experiences,
  onChange,
  onAdd,
  onAddBullet
}: {
  experiences: Experience[],
  onChange: (experiences: Experience[]) => void,
  onAdd: () => void,
  onAddBullet: (index: number) => void
}) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold mb-2">Experience</h3>
    {experiences.map((exp, index) => (
      <div key={index} className="border-input border p-3 rounded mb-3">
        <div className="grid gap-3">
          <input
            type="text"
            placeholder="Company"
            value={exp.company}
            onChange={(e) => {
              const newExperience = [...experiences];
              newExperience[index].company = e.target.value;
              onChange(newExperience);
            }}
            className="border-input border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Position"
            value={exp.position}
            onChange={(e) => {
              const newExperience = [...experiences];
              newExperience[index].position = e.target.value;
              onChange(newExperience);
            }}
            className="border-input border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={exp.location}
            onChange={(e) => {
              const newExperience = [...experiences];
              newExperience[index].location = e.target.value;
              onChange(newExperience);
            }}
            className="border-input border p-2 rounded"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Start Date"
              value={exp.startDate}
              onChange={(e) => {
                const newExperience = [...experiences];
                newExperience[index].startDate = e.target.value;
                onChange(newExperience);
              }}
              className="border-input border p-2 rounded"
            />
            <input
              type="text"
              placeholder="End Date"
              value={exp.endDate}
              onChange={(e) => {
                const newExperience = [...experiences];
                newExperience[index].endDate = e.target.value;
                onChange(newExperience);
              }}
              className="border-input border p-2 rounded"
            />
          </div>

          <div className="space-y-2">
            {exp.bulletPoints.map((bullet, bulletIndex) => (
              <input
                key={bulletIndex}
                type="text"
                placeholder="• Bullet Point"
                value={bullet.text}
                onChange={(e) => {
                  const newExperience = [...experiences];
                  newExperience[index].bulletPoints[bulletIndex].text = e.target.value;
                  onChange(newExperience);
                }}
                className="border-input border p-2 rounded w-full"
              />
            ))}
            <button
              onClick={() => onAddBullet(index)}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
            >
              Add Bullet Point
            </button>
          </div>
        </div>
      </div>
    ))}
    <button
      onClick={onAdd}
      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
    >
      Add Experience
    </button>
  </div>
);
