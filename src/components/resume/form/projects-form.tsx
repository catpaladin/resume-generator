import { Project } from "@/types/resume";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TextInput, TextArea } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { IconButton } from "@/components/ui/button/icon-button";
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
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          Showcase key projects. Include a short description and an optional
          link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="rounded-lg border p-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                <TextInput
                  label="Project Name"
                  placeholder="e.g., Resume Builder"
                  value={project.name}
                  onChange={(e) =>
                    updateProject(project.id, "name", e.target.value)
                  }
                />
                <TextInput
                  type="url"
                  label="Project Link (optional)"
                  placeholder="https://example.com"
                  value={project.link}
                  onChange={(e) =>
                    updateProject(project.id, "link", e.target.value)
                  }
                />
                <TextArea
                  label="Project Description"
                  placeholder="What it does, your role, and impact"
                  value={project.description}
                  onChange={(e) =>
                    updateProject(project.id, "description", e.target.value)
                  }
                  className="min-h-[80px] resize-y"
                />
              </div>
              <IconButton
                variant="ghost"
                aria-label="Remove project"
                icon={<X size={18} />}
                onClick={() => removeProject(project.id)}
              />
            </div>
          </div>
        ))}
        <div>
          <Button
            type="button"
            variant="link"
            className="px-0"
            onClick={addProject}
          >
            <Plus size={16} className="mr-2" /> Add Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
