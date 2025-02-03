"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { ResumeData } from './types';

export const ResumePreview = ({ data }: { data: ResumeData }) => {
  const { theme, setTheme } = useTheme();

  const handlePrint = async () => {
    // Store the current theme
    const currentTheme = theme;
    // Switch to light theme
    setTheme('light');

    // Wait a moment for the theme to update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Print
    window.print();

    // Restore the original theme after printing
    setTimeout(() => {
      setTheme(currentTheme);
    }, 100);
  };

  return (
    <Card className="p-4 bg-card">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-foreground">Resume Preview</h2>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      {/* Rest of your component stays exactly the same */}
      <div className="space-y-3" id="resume-preview">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-foreground">{data.fullName}</h1>
          <p className="text-muted-foreground text-sm">
            {[
              data.location,
              data.email,
              data.phone,
              data.linkedin
            ].filter(Boolean).join(' | ')}
          </p>
        </div>

        {/* Summary */}
        {data.summary && (
          <div>
            <h2 className="text-base font-bold mb-1 text-foreground">Professional Summary</h2>
            <p className="text-muted-foreground text-sm">{data.summary}</p>
          </div>
        )}

        {/* Skills */}
        {data.skills.some(skill => skill) && (
          <div>
            <h2 className="text-base font-bold mb-1 text-foreground">Skills</h2>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((skill, index) => (
                skill && (
                  <span
                    key={index}
                    className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-sm"
                  >
                    {skill}
                  </span>
                )
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {data.experience.some(exp => exp.company || exp.position) && (
          <div>
            <h2 className="text-base font-bold mb-1 text-foreground">Professional Experience</h2>
            {data.experience.map((exp, index) => (
              exp.company && (
                <div key={index} className="mb-2">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <h3 className="font-semibold text-foreground">{exp.company}</h3>
                      <div className="flex gap-2 items-baseline">
                        <p className="font-medium text-foreground text-sm">{exp.position}</p>
                        {exp.location && (
                          <span className="text-muted-foreground text-sm">| {exp.location}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-muted-foreground text-sm shrink-0">
                      {[exp.startDate, exp.endDate].filter(Boolean).join(' - ')}
                    </span>
                  </div>
                  <ul className="list-disc ml-4 mt-0.5 space-y-0.5">
                    {exp.bulletPoints.map((bullet, bulletIndex) => (
                      bullet.text && (
                        <li key={bulletIndex} className="text-muted-foreground text-sm">
                          {bullet.text}
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.some(edu => edu.school || edu.degree) && (
          <div>
            <h2 className="text-base font-bold mb-1 text-foreground">Education</h2>
            {data.education.map((edu, index) => (
              edu.school && (
                <div key={index} className="mb-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-foreground">{edu.school}</h3>
                    <span className="text-muted-foreground text-sm">{edu.graduationYear}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{edu.degree}</p>
                </div>
              )
            ))}
          </div>
        )}

        {/* Projects */}
        {data.projects.some(project => project.name || project.link) && (
          <div>
            <h2 className="text-base font-bold mb-1 text-foreground">Projects</h2>
            {data.projects.map((project, index) => (
              project.name && (
                <div key={index} className="mb-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-foreground">{project.name}</h3>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm truncate ml-4"
                        style={{ maxWidth: '50%' }}
                      >
                        {project.link}
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-muted-foreground text-sm">{project.description}</p>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </Card>
  );
};
