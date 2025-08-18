import { Skill } from "@/types/resume";
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
import { Plus, X, Sparkles } from "lucide-react";
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

interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addSkill = () => {
    onChange([...skills, { id: crypto.randomUUID(), name: "", category: "" }]);
  };

  const removeSkill = (id: string) => {
    onChange(skills.filter((skill) => skill.id !== id));
  };

  const updateSkill = (
    id: string,
    updatedField: Partial<Omit<Skill, "id">>,
  ) => {
    onChange(
      skills.map((skill) =>
        skill.id === id ? { ...skill, ...updatedField } : skill,
      ),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = skills.findIndex((skill) => skill.id === active.id);
      const newIndex = skills.findIndex((skill) => skill.id === over?.id);
      onChange(arrayMove(skills, oldIndex, newIndex));
    }
  };

  return (
    <Card className="border-gradient-to-br from-accent/10 to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles size={20} className="text-accent" />
          Skills
        </CardTitle>
        <CardDescription>
          Drag to reorder • Organize skills by category for better presentation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={skills.map((skill) => skill.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {skills.map((skill) => (
                <SortableItem key={skill.id} id={skill.id}>
                  <div className="grid grid-cols-1 items-start gap-3 p-4 md:grid-cols-2">
                    <TextInput
                      label="Skill"
                      placeholder="e.g., JavaScript"
                      value={skill.name}
                      onChange={(e) =>
                        updateSkill(skill.id, { name: e.target.value })
                      }
                    />
                    <div className="flex items-end gap-2">
                      <TextInput
                        label="Category"
                        placeholder="e.g., Programming Languages"
                        value={skill.category || ""}
                        onChange={(e) =>
                          updateSkill(skill.id, { category: e.target.value })
                        }
                        className="flex-1"
                      />
                      <IconButton
                        variant="ghost"
                        aria-label="Remove skill"
                        icon={<X size={18} />}
                        onClick={() => removeSkill(skill.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      />
                    </div>
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
            className="border-accent/30 text-accent hover:bg-accent/5 border-dashed"
            onClick={addSkill}
          >
            <Plus size={16} className="mr-2" /> Add Skill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
