import { Education } from "@/types/resume";

interface EducationSectionProps {
  education: Education[];
}

export function EducationSection({ education }: EducationSectionProps) {
  if (!education.some((edu) => edu.school || edu.degree)) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-2 text-base font-bold text-foreground">Education</h2>
      <div className="space-y-3">
        {education.map(
          (edu) =>
            edu.school && (
              <div key={edu.id} className="space-y-0.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold text-foreground">
                    {edu.school}
                  </h3>
                  {edu.graduationYear && (
                    <span className="text-sm text-muted-foreground">
                      {edu.graduationYear}
                    </span>
                  )}
                </div>
                {edu.degree && (
                  <p className="text-sm text-muted-foreground">{edu.degree}</p>
                )}
              </div>
            ),
        )}
      </div>
    </section>
  );
}
