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
import { Plus, X, GripVertical } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

interface ExperienceFormProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

export function ExperienceForm({ experiences, onChange }: ExperienceFormProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience</CardTitle>
        <CardDescription>
          Focus on impact. Start bullet points with strong verbs and quantify
          results where possible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {experiences.map((exp) => (
          <div key={exp.id} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
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
                      updateExperience(exp.id, "position", e.target.value)
                    }
                  />
                  <TextInput
                    label="Location"
                    placeholder="City, Country"
                    value={exp.location}
                    onChange={(e) =>
                      updateExperience(exp.id, "location", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <TextInput
                    label="Start Date"
                    placeholder="e.g., Jan 2023"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(exp.id, "startDate", e.target.value)
                    }
                  />
                  <TextInput
                    label="End Date"
                    placeholder="e.g., Present"
                    value={exp.endDate}
                    onChange={(e) =>
                      updateExperience(exp.id, "endDate", e.target.value)
                    }
                  />
                </div>
              </div>
              <IconButton
                variant="ghost"
                aria-label="Remove experience"
                icon={<X size={18} />}
                onClick={() => removeExperience(exp.id)}
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Bullet Points</h4>
              {exp.bulletPoints.map((bullet) => (
                <div key={bullet.id} className="flex items-center gap-2">
                  <GripVertical size={16} className="text-muted-foreground" />
                  <TextareaAutosize
                    placeholder="Describe your achievement or responsibility"
                    value={bullet.text}
                    onChange={(e) =>
                      updateBulletPoint(exp.id, bullet.id, e.target.value)
                    }
                    minRows={1}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <IconButton
                    variant="ghost"
                    aria-label="Remove bullet point"
                    icon={<X size={18} />}
                    onClick={() => removeBulletPoint(exp.id, bullet.id)}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={() => addBulletPoint(exp.id)}
              >
                <Plus size={16} className="mr-2" /> Add Bullet Point
              </Button>
            </div>
          </div>
        ))}
        <div>
          <Button
            type="button"
            variant="link"
            className="px-0"
            onClick={addExperience}
          >
            <Plus size={16} className="mr-2" /> Add Experience
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
