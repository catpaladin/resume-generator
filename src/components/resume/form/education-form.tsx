import { Education } from "@/types/resume";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { IconButton } from "@/components/ui/button/icon-button";
import { SortableItem } from "@/components/ui/sortable-item";
import { Plus, X, GraduationCap } from "lucide-react";
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

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addEducation = () => {
    onChange([
      ...education,
      {
        id: crypto.randomUUID(),
        school: "",
        degree: "",
        graduationYear: "",
      },
    ]);
  };

  const removeEducation = (id: string) => {
    onChange(education.filter((edu) => edu.id !== id));
  };

  const updateEducation = (
    id: string,
    field: keyof Education,
    value: string,
  ) => {
    onChange(
      education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu,
      ),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = education.findIndex((edu) => edu.id === active.id);
      const newIndex = education.findIndex((edu) => edu.id === over?.id);
      onChange(arrayMove(education, oldIndex, newIndex));
    }
  };

  return (
    <Card className="border-gradient-to-br from-info/10 to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap size={20} className="text-info" />
          Education
        </CardTitle>
        <CardDescription>
          Drag to reorder • List your most relevant education background
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={education.map((edu) => edu.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {education.map((edu) => (
                <SortableItem key={edu.id} id={edu.id}>
                  <div className="flex gap-4 p-4">
                    <div className="flex-1 space-y-3">
                      <TextInput
                        label="School"
                        placeholder="e.g., University of Somewhere"
                        value={edu.school}
                        onChange={(e) =>
                          updateEducation(edu.id, "school", e.target.value)
                        }
                      />
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <TextInput
                          label="Degree"
                          placeholder="e.g., B.Sc. Computer Science"
                          value={edu.degree}
                          onChange={(e) =>
                            updateEducation(edu.id, "degree", e.target.value)
                          }
                        />
                        <TextInput
                          label="Graduation Year"
                          placeholder="e.g., 2024"
                          value={edu.graduationYear}
                          onChange={(e) =>
                            updateEducation(
                              edu.id,
                              "graduationYear",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                    <IconButton
                      variant="ghost"
                      aria-label="Remove education"
                      icon={<X size={18} />}
                      onClick={() => removeEducation(edu.id)}
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
            className="border-info/30 text-info hover:bg-info/5 border-dashed"
            onClick={addEducation}
          >
            <Plus size={16} className="mr-2" /> Add Education
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
