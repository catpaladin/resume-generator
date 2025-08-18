import { Education } from "@/types/resume";

interface EducationSectionProps {
  education: Education[];
}

export function EducationSection({ education }: EducationSectionProps) {
  if (!education || !education.some((edu) => edu.school || edu.degree)) {
    return null;
  }

  return (
    <section>
      <h2 className="text-foreground mb-2 text-base font-bold">Education</h2>
      <div className="space-y-3">
        {education.map(
          (edu) =>
            edu.school && (
              <div key={edu.id} className="space-y-0.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-foreground font-semibold">
                    {edu.school}
                  </h3>
                  {edu.graduationYear && (
                    <span className="text-muted-foreground text-sm">
                      {edu.graduationYear}
                    </span>
                  )}
                </div>
                {edu.degree && (
                  <p className="text-muted-foreground text-sm">{edu.degree}</p>
                )}
              </div>
            ),
        )}
      </div>
    </section>
  );
}
