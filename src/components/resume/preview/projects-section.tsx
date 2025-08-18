import { Project } from "@/types/resume";

interface ProjectsSectionProps {
  projects: Project[];
}

function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (!projects?.some((project) => project.name || project.description)) {
    return null;
  }

  return (
    <section>
      <h2 className="text-foreground mb-2 text-base font-bold">Projects</h2>
      <div className="space-y-3">
        {projects.map(
          (project) =>
            project.name && (
              <div key={project.id} className="space-y-1">
                <div className="mb-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-foreground font-semibold">
                    {project.name}
                  </h3>
                  {project.link && isValidUrl(project.link) && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary mt-0.5 text-sm break-all hover:underline sm:mt-0 sm:ml-4"
                    >
                      {project.link}
                    </a>
                  )}
                </div>
                {project.description && (
                  <p className="text-muted-foreground text-sm">
                    {project.description}
                  </p>
                )}
              </div>
            ),
        )}
      </div>
    </section>
  );
}
