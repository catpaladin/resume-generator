"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { ResumeData } from './types';

interface ResumePreviewProps {
  data: ResumeData;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Card className="p-4 bg-card">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-card z-10 pb-2">
        <h2 className="text-xl font-bold text-foreground">Preview</h2>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      <div className="space-y-4 text-foreground" id="resume-preview">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">{data.fullName}</h1>
          <p className="text-muted-foreground">
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
          <section>
            <h2 className="text-lg font-bold mb-1">Professional Summary</h2>
            <p className="text-muted-foreground">{data.summary}</p>
          </section>
        )}

        {/* Skills */}
        {data.skills.some(Boolean) && (
          <section>
            <h2 className="text-lg font-bold mb-1">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                skill && (
                  <span
                    key={index}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
                  >
                    {skill}
                  </span>
                )
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {data.experience.some(exp => exp.company || exp.position) && (
          <section>
            <h2 className="text-lg font-bold mb-1">Experience</h2>
            {data.experience.map((exp, index) => (
              exp.company && (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold">{exp.company}</h3>
                    <span className="text-muted-foreground text-sm">
                      {[exp.startDate, exp.endDate].filter(Boolean).join(' - ')}
                    </span>
                  </div>
                  <p className="font-medium text-muted-foreground">{exp.position}</p>
                  <ul className="list-disc ml-4 mt-1 space-y-1">
                    {exp.bulletPoints.map((bullet, bulletIndex) => (
                      bullet.text && (
                        <li key={bulletIndex} className="text-muted-foreground">
                          {bullet.text}
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )
            ))}
          </section>
        )}

        {/* Education */}
        {data.education.some(edu => edu.school || edu.degree) && (
          <section>
            <h2 className="text-lg font-bold mb-1">Education</h2>
            {data.education.map((edu, index) => (
              edu.school && (
                <div key={index} className="mb-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold">{edu.school}</h3>
                    <span className="text-muted-foreground text-sm">{edu.graduationYear}</span>
                  </div>
                  <p className="text-muted-foreground">{edu.degree}</p>
                </div>
              )
            ))}
          </section>
        )}

        {/* Projects */}
        {data.projects.some(project => project.name || project.link) && (
          <section>
            <h2 className="text-lg font-bold mb-1">Projects</h2>
            {data.projects.map((project, index) => (
              project.name && (
                <div key={index} className="mb-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold">{project.name}</h3>
                    {project.link && (
                      <div className="flex items-center gap-2">
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm break-all"
                        >
                          {project.link}
                        </a>
                      </div>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-muted-foreground">{project.description}</p>
                  )}
                </div>
              )
            ))}
          </section>
        )}
      </div>
    </Card>
  );
};
