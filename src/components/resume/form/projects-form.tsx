import { Project } from "@/types/resume";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const addProject = () => {
    onChange([
      ...projects,
      {
        id: crypto.randomUUID(),
        name: "",
        link: "",
        description: "",
      },
    ]);
  };

  const removeProject = (id: string) => {
    onChange(projects.filter((project) => project.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    onChange(
      projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project,
      ),
    );
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Projects</h3>
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="p-4 border rounded-lg">
            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={project.name}
                  onChange={(e) =>
                    updateProject(project.id, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md border-input bg-background"
                />
                <input
                  type="url"
                  placeholder="Project Link (optional)"
                  value={project.link}
                  onChange={(e) =>
                    updateProject(project.id, "link", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md border-input bg-background"
                />
                <textarea
                  placeholder="Project Description"
                  value={project.description}
                  onChange={(e) =>
                    updateProject(project.id, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md border-input bg-background min-h-[80px] resize-y"
                />
              </div>
              <button
                onClick={() => removeProject(project.id)}
                className="p-2 text-muted-foreground hover:text-destructive"
                aria-label="Remove project"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={addProject}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
      >
        <Plus size={16} />
        Add Project
      </button>
    </Card>
  );
}
