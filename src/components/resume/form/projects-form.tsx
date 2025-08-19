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
import { SortableItem } from "@/components/ui/sortable-item";
import { Plus, X, Code } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = projects.findIndex(
        (project) => project.id === active.id,
      );
      const newIndex = projects.findIndex((project) => project.id === over?.id);
      onChange(arrayMove(projects, oldIndex, newIndex));
    }
  };

  return (
    <Card className="border-gradient-to-br from-warning/10 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Code size={20} className="text-warning" />
          Projects
        </CardTitle>
        <CardDescription>
          Drag to reorder • Showcase your most impactful work
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects.map((project) => project.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {projects.map((project) => (
                <SortableItem key={project.id} id={project.id}>
                  <div className="flex gap-4 p-4">
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
                          updateProject(
                            project.id,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <IconButton
                      variant="ghost"
                      aria-label="Remove project"
                      icon={<X size={18} />}
                      onClick={() => removeProject(project.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    />
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            className="border-dashed border-warning/30 text-warning hover:bg-warning/5"
            onClick={addProject}
          >
            <Plus size={16} className="mr-2" /> Add Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
