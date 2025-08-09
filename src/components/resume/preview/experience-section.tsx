import { Experience } from "@/types/resume";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  if (!experiences || !experiences.some((exp) => exp.company || exp.position)) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-2 text-base font-bold text-foreground">
        Professional Experience
      </h2>
      <div className="space-y-4">
        {experiences.map(
          (exp) =>
            exp.company && (
              <div key={exp.id} className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {exp.company}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {exp.position}
                      </p>
                      {exp.location && (
                        <span className="text-sm text-muted-foreground">
                          • {exp.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-sm text-muted-foreground">
                    {[exp.startDate, exp.endDate].filter(Boolean).join(" - ")}
                  </span>
                </div>

                {exp.bulletPoints.length > 0 && (
                  <ul className="ml-4 list-disc space-y-0.5">
                    {exp.bulletPoints.map(
                      (bullet) =>
                        bullet.text && (
                          <li
                            key={bullet.id}
                            className="overflow-visible whitespace-normal text-sm text-muted-foreground"
                          >
                            {bullet.text}
                          </li>
                        ),
                    )}
                  </ul>
                )}
              </div>
            ),
        )}
      </div>
    </section>
  );
}
