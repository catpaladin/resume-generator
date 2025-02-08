import { Experience } from "@/types/resume";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  if (!experiences.some((exp) => exp.company || exp.position)) {
    return null;
  }

  return (
    <section>
      <h2 className="text-base font-bold mb-2 text-foreground">
        Professional Experience
      </h2>
      <div className="space-y-4">
        {experiences.map(
          (exp) =>
            exp.company && (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {exp.company}
                    </h3>
                    <div className="flex gap-2 items-baseline">
                      <p className="font-medium text-foreground text-sm">
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
                  <ul className="list-disc ml-4 space-y-0.5">
                    {exp.bulletPoints.map(
                      (bullet) =>
                        bullet.text && (
                          <li
                            key={bullet.id}
                            className="text-muted-foreground text-sm"
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
