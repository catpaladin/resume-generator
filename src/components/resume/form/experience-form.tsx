import { Experience } from "@/types/resume";
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
import { Plus, X, GripVertical, Briefcase } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
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

interface ExperienceFormProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

export function ExperienceForm({ experiences, onChange }: ExperienceFormProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addExperience = () => {
    onChange([
      ...experiences,
      {
        id: crypto.randomUUID(),
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        bulletPoints: [{ id: crypto.randomUUID(), text: "" }],
      },
    ]);
  };

  const removeExperience = (id: string) => {
    onChange(experiences.filter((exp) => exp.id !== id));
  };

  const updateExperience = (
    id: string,
    field: keyof Experience,
    value: string,
  ) => {
    onChange(
      experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
    );
  };

  const addBulletPoint = (experienceId: string) => {
    onChange(
      experiences.map((exp) =>
        exp.id === experienceId
          ? {
              ...exp,
              bulletPoints: [
                ...exp.bulletPoints,
                { id: crypto.randomUUID(), text: "" },
              ],
            }
          : exp,
      ),
    );
  };

  const updateBulletPoint = (
    experienceId: string,
    bulletId: string,
    text: string,
  ) => {
    onChange(
      experiences.map((exp) =>
        exp.id === experienceId
          ? {
              ...exp,
              bulletPoints: exp.bulletPoints.map((bullet) =>
                bullet.id === bulletId ? { ...bullet, text } : bullet,
              ),
            }
          : exp,
      ),
    );
  };

  const removeBulletPoint = (experienceId: string, bulletId: string) => {
    onChange(
      experiences.map((exp) =>
        exp.id === experienceId
          ? {
              ...exp,
              bulletPoints: exp.bulletPoints.filter(
                (bullet) => bullet.id !== bulletId,
              ),
            }
          : exp,
      ),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = experiences.findIndex((exp) => exp.id === active.id);
      const newIndex = experiences.findIndex((exp) => exp.id === over?.id);
      onChange(arrayMove(experiences, oldIndex, newIndex));
    }
  };

  return (
    <Card className="border-gradient-to-br from-primary/10 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Briefcase size={20} className="text-primary" />
          Experience
        </CardTitle>
        <CardDescription>
          Drag to reorder • Focus on impact and quantifiable results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={experiences.map((exp) => exp.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {experiences.map((exp) => (
                <SortableItem key={exp.id} id={exp.id}>
                  <div className="space-y-3 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <TextInput
                          label="Company"
                          placeholder="e.g., Acme Inc."
                          value={exp.company}
                          onChange={(e) =>
                            updateExperience(exp.id, "company", e.target.value)
                          }
                        />
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <TextInput
                            label="Position"
                            placeholder="e.g., Senior Software Engineer"
                            value={exp.position}
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "position",
                                e.target.value,
                              )
                            }
                          />
                          <TextInput
                            label="Location"
                            placeholder="City, Country"
                            value={exp.location}
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "location",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <TextInput
                            label="Start Date"
                            placeholder="e.g., Jan 2023"
                            value={exp.startDate}
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "startDate",
                                e.target.value,
                              )
                            }
                          />
                          <TextInput
                            label="End Date"
                            placeholder="e.g., Present"
                            value={exp.endDate}
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "endDate",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      <IconButton
                        variant="ghost"
                        aria-label="Remove experience"
                        icon={<X size={18} />}
                        onClick={() => removeExperience(exp.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground">
                        Key Achievements
                      </h4>
                      <div className="space-y-1.5">
                        {exp.bulletPoints.map((bullet) => (
                          <div
                            key={bullet.id}
                            className="flex items-start gap-2"
                          >
                            <div className="mt-2">
                              <GripVertical
                                size={12}
                                className="text-muted-foreground"
                              />
                            </div>
                            <TextareaAutosize
                              placeholder="Describe your achievement or responsibility"
                              value={bullet.text}
                              onChange={(e) =>
                                updateBulletPoint(
                                  exp.id,
                                  bullet.id,
                                  e.target.value,
                                )
                              }
                              minRows={1}
                              className="flex-1 resize-none rounded-lg border border-input bg-background/60 px-3 py-2 text-sm backdrop-blur-sm transition-all placeholder:text-muted-foreground hover:border-ring/30 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            />
                            <IconButton
                              variant="ghost"
                              aria-label="Remove bullet point"
                              icon={<X size={16} />}
                              onClick={() =>
                                removeBulletPoint(exp.id, bullet.id)
                              }
                              className="hover:bg-destructive/10 hover:text-destructive mt-1"
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-dashed border-primary/30 text-primary hover:bg-primary/5"
                          onClick={() => addBulletPoint(exp.id)}
                        >
                          <Plus size={14} className="mr-1" /> Add Achievement
                        </Button>
                      </div>
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
            className="border-dashed border-primary/30 text-primary hover:bg-primary/5"
            onClick={addExperience}
          >
            <Plus size={16} className="mr-2" /> Add Experience
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
