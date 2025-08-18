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
      <h2 className="text-foreground mb-2 text-base font-bold">
        Professional Experience
      </h2>
      <div className="space-y-4">
        {experiences.map(
          (exp) =>
            exp.company && (
              <div key={exp.id} className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-foreground font-semibold">
                      {exp.company}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <p className="text-foreground text-sm font-medium">
                        {exp.position}
                      </p>
                      {exp.location && (
                        <span className="text-muted-foreground text-sm">
                          • {exp.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-muted-foreground text-sm whitespace-nowrap">
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
                            className="text-muted-foreground overflow-visible text-sm whitespace-normal"
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
