"use client";

import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { PersonalInfoSection, SkillsSection, ExperienceSection } from './form-sections-core';
import { EducationSection, ProjectsSection } from './form-sections-etc';
import { ResumePreview } from './preview';
import { usePersistedState, exportResumeData, importResumeData } from '@/lib/hooks/use-persisted-state';
import { Download, Upload, Trash2, User, Briefcase, GraduationCap, Code, Lightbulb } from 'lucide-react';
import type { ResumeData, Experience, Education, Project } from './types';

type TabType = 'personal' | 'skills' | 'experience' | 'education' | 'projects';

// Define empty states for all types to ensure consistent initialization
const emptyExperience: Experience = {
  company: '',
  position: '',
  location: '',
  startDate: '',
  endDate: '',
  bulletPoints: [{ text: '' }]
};

const emptyEducation: Education = {
  school: '',
  degree: '',
  graduationYear: ''
};

const emptyProject: Project = {
  name: '',
  link: '',
  description: ''
};

const initialResumeData: ResumeData = {
  fullName: '',
  location: '',
  email: '',
  phone: '',
  linkedin: '',
  summary: '',
  skills: [''],
  experience: [{ ...emptyExperience }], // Use spread to ensure a new object
  education: [{ ...emptyEducation }],
  projects: [{ ...emptyProject }]
};

const tabButtons = [
  { id: 'personal', icon: User, label: 'Personal Info' },
  { id: 'skills', icon: Lightbulb, label: 'Skills' },
  { id: 'experience', icon: Briefcase, label: 'Experience' },
  { id: 'education', icon: GraduationCap, label: 'Education' },
  { id: 'projects', icon: Code, label: 'Projects' }
] as const;

const ResumeGenerator = () => {
  const [resumeData, setResumeData] = usePersistedState(initialResumeData);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      [field]: [...(prev[field] as T[]), { ...initialValue }] // Use spread to ensure a new object
    }));
  };

  const addBulletPoint = (experienceIndex: number) => {
    const newExperience = [...resumeData.experience];
    newExperience[experienceIndex].bulletPoints.push({ text: '' });
    handleInputChange('experience', newExperience);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importResumeData(file);
      // Ensure all imported data has the correct structure
      const validatedData = {
        ...initialResumeData, // Start with default empty values
        ...importedData, // Overlay imported data
        experience: importedData.experience.map(exp => ({
          ...emptyExperience, // Ensure all fields exist
          ...exp
        })),
        education: importedData.education.map(edu => ({
          ...emptyEducation,
          ...edu
        })),
        projects: importedData.projects.map(proj => ({
          ...emptyProject,
          ...proj
        }))
      };
      setResumeData(validatedData);
    } catch (error) {
      alert('Failed to import resume data: ' + (error as Error).message);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setResumeData(initialResumeData);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoSection
            data={resumeData}
            onChange={handleInputChange}
          />
        );
      case 'skills':
        return (
          <SkillsSection
            skills={resumeData.skills}
            onChange={(skills) => handleInputChange('skills', skills)}
            onAdd={() => addItem('skills', '')}
          />
        );
      case 'experience':
        return (
          <ExperienceSection
            experiences={resumeData.experience}
            onChange={(experience) => handleInputChange('experience', experience)}
            onAdd={() => addItem('experience', { ...emptyExperience })}
            onAddBullet={addBulletPoint}
          />
        );
      case 'education':
        return (
          <EducationSection
            education={resumeData.education}
            onChange={(education) => handleInputChange('education', education)}
            onAdd={() => addItem('education', { ...emptyEducation })}
          />
        );
      case 'projects':
        return (
          <ProjectsSection
            projects={resumeData.projects}
            onChange={(projects) => handleInputChange('projects', projects)}
            onAdd={() => addItem('projects', { ...emptyProject })}
          />
        );
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4 h-screen overflow-hidden">
      {/* Form Section - Left Side */}
      <div className="flex flex-col h-screen">
        <Card className="p-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Resume Builder</h2>
            <div className="flex gap-2">
              <button
                onClick={() => exportResumeData(resumeData)}
                className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                title="Export Data"
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                title="Import Data"
              >
                <Upload size={16} />
                Import
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                title="Reset All Data"
              >
                <Trash2 size={16} />
                Reset
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </Card>

        {/* Tab Buttons */}
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {tabButtons.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shrink-0 ${
                activeTab === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <Card className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
          {renderTabContent()}
        </Card>
      </div>

      {/* Preview Section - Right Side */}
      <div className="overflow-y-auto">
        <ResumePreview data={resumeData} />
      </div>
    </div>
  );
};

export default ResumeGenerator;
