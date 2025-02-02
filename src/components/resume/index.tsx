"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PersonalInfoSection, SkillsSection, ExperienceSection } from './form-sections-core';
import { EducationSection, ProjectsSection } from './form-sections-etc';
import { ResumePreview } from './preview';
import type { ResumeData, Experience, Education, Project } from './types';

const initialResumeData: ResumeData = {
  fullName: '',
  location: '',
  email: '',
  phone: '',
  linkedin: '',
  summary: '',
  skills: [''],
  experience: [{
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    bulletPoints: [{ text: '' }]
  }],
  education: [{ school: '', degree: '', graduationYear: '' }],
  projects: [{ name: '', link: '', description: '' }]
};

const ResumeGenerator: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  const handleInputChange = (
    field: keyof ResumeData,
    value: string | string[] | Experience[] | Education[] | Project[]
  ) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = <T extends unknown>(
    field: keyof ResumeData,
    initialValue: T
  ) => {
    setResumeData(prev => ({
      ...prev,
      [field]: [...(prev[field] as T[]), initialValue]
    }));
  };

  const addBulletPoint = (experienceIndex: number) => {
    const newExperience = [...resumeData.experience];
    newExperience[experienceIndex].bulletPoints.push({ text: '' });
    handleInputChange('experience', newExperience);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4 h-screen overflow-hidden">
      {/* Form Section - Left Side */}
      <div className="overflow-y-auto pb-8 pr-2">
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-3">Resume Builder</h2>

          <PersonalInfoSection
            data={resumeData}
            onChange={handleInputChange}
          />

          <Separator className="my-4" />

          <SkillsSection
            skills={resumeData.skills}
            onChange={(skills) => handleInputChange('skills', skills)}
            onAdd={() => addItem('skills', '')}
          />

          <Separator className="my-4" />

          <ExperienceSection
            experiences={resumeData.experience}
            onChange={(experience) => handleInputChange('experience', experience)}
            onAdd={() => addItem('experience', {
              company: '',
              position: '',
              startDate: '',
              endDate: '',
              bulletPoints: [{ text: '' }]
            })}
            onAddBullet={addBulletPoint}
          />

          <Separator className="my-4" />

          <EducationSection
            education={resumeData.education}
            onChange={(education) => handleInputChange('education', education)}
            onAdd={() => addItem('education', {
              school: '',
              degree: '',
              graduationYear: ''
            })}
          />

          <Separator className="my-4" />

          <ProjectsSection
            projects={resumeData.projects}
            onChange={(projects) => handleInputChange('projects', projects)}
            onAdd={() => addItem('projects', {
              name: '',
              link: '',
              description: ''
            })}
          />
        </Card>
      </div>

      {/* Preview Section - Right Side */}
      <div className="overflow-y-auto pb-8 pl-2">
        <ResumePreview data={resumeData} />
      </div>
    </div>
  );
};

export default ResumeGenerator;
