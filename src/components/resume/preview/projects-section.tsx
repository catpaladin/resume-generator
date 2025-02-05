import { Project } from '@/types/resume';

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
  if (!projects?.some(project => project.name || project.description)) {
    return null;
  }

  return (
    <section>
      <h2 className="text-base font-bold mb-2 text-foreground">
        Projects
      </h2>
      <div className="space-y-3">
        {projects.map((project) => (
          project.name && (
            <div key={project.id} className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                <h3 className="font-semibold text-foreground">
                  {project.name}
                </h3>
                {project.link && isValidUrl(project.link) && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm mt-0.5 sm:mt-0 sm:ml-4 break-all"
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
          )
        ))}
      </div>
    </section>
  );
}
